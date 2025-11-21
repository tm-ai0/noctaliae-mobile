#!/bin/bash
# 🚀 Script de déploiement automatisé du prompt scientifique Noctaliæ
# Usage: ./deploy.sh [config_file]

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Fonction pour charger la config
load_config() {
    local config_file=${1:-"config.env"}
    
    if [[ ! -f "$config_file" ]]; then
        log_error "Fichier de configuration non trouvé : $config_file"
        log_info "Créez-le à partir de config.env.example"
        exit 1
    fi
    
    log_info "Chargement de la configuration : $config_file"
    source "$config_file"
    log_success "Configuration chargée"
}

# Fonction de préparation du prompt
prepare_prompt() {
    log_info "Préparation du prompt scientifique..."
    python3 prepare_prompt.py
    
    if [[ ! -f "formatted_prompt.py" ]]; then
        log_error "Échec de la génération du prompt formaté"
        exit 1
    fi
    
    log_success "Prompt préparé et formaté"
}

# Fonction de test de connexion SSH
test_ssh_connection() {
    log_info "Test de connexion SSH à $SSH_USER@$SSH_HOST:$SSH_PORT..."
    
    if ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "echo 'OK'" &> /dev/null; then
        log_success "Connexion SSH réussie"
        return 0
    else
        log_error "Impossible de se connecter au serveur"
        log_info "Vérifiez vos identifiants SSH dans config.env"
        exit 1
    fi
}

# Fonction pour localiser le fichier backend
locate_backend() {
    log_info "Recherche du fichier backend sur le serveur..."
    
    # Chercher le fichier contenant "/chat-text" ou "chat_text"
    local result=$(ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "find $BACKEND_DIR -type f -name '*.py' -exec grep -l 'chat.*text' {} \; 2>/dev/null | head -1")
    
    if [[ -z "$result" ]]; then
        log_warning "Fichier backend non trouvé automatiquement"
        log_info "Utilisation du chemin configuré : $BACKEND_DIR/$BACKEND_FILE"
        return 0
    fi
    
    log_success "Backend trouvé : $result"
    BACKEND_FILE=$(basename "$result")
    BACKEND_DIR=$(dirname "$result")
}

# Fonction de backup
create_backup() {
    log_info "Création d'un backup du backend actuel..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="backup_${timestamp}_${BACKEND_FILE}"
    
    ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "mkdir -p $BACKUP_DIR && cp $BACKEND_DIR/$BACKEND_FILE $BACKUP_DIR/$backup_name"
    
    log_success "Backup créé : $BACKUP_DIR/$backup_name"
}

# Fonction pour extraire l'ancien prompt
extract_old_prompt() {
    log_info "Extraction de l'ancien prompt pour référence..."
    
    ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "grep -A 50 'SYSTEM_PROMPT' $BACKEND_DIR/$BACKEND_FILE" > old_prompt.txt 2>/dev/null || true
    
    if [[ -f "old_prompt.txt" ]] && [[ -s "old_prompt.txt" ]]; then
        log_success "Ancien prompt sauvegardé dans old_prompt.txt"
    else
        log_warning "Impossible d'extraire l'ancien prompt (normal si première installation)"
    fi
}

# Fonction de déploiement du nouveau prompt
deploy_prompt() {
    log_info "Déploiement du nouveau prompt scientifique..."
    
    # Lire le prompt formaté
    local new_prompt=$(cat formatted_prompt.py)
    
    # Créer un script Python temporaire pour remplacer le prompt
    cat > replace_prompt.py << 'PYTHON_EOF'
import sys
import re

def replace_system_prompt(file_path, new_prompt):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern pour trouver SYSTEM_PROMPT = """..."""
    pattern = r'SYSTEM_PROMPT\s*=\s*""".*?"""'
    
    if re.search(pattern, content, re.DOTALL):
        # Remplacer l'ancien prompt
        new_content = re.sub(pattern, new_prompt.strip(), content, flags=re.DOTALL)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("✅ Prompt remplacé avec succès")
        return True
    else:
        print("❌ SYSTEM_PROMPT non trouvé dans le fichier")
        return False

if __name__ == "__main__":
    file_path = sys.argv[1]
    new_prompt = sys.stdin.read()
    success = replace_system_prompt(file_path, new_prompt)
    sys.exit(0 if success else 1)
PYTHON_EOF
    
    # Copier le script et le nouveau prompt sur le serveur
    scp -i "$SSH_KEY_PATH" -P "$SSH_PORT" replace_prompt.py formatted_prompt.py \
        "$SSH_USER@$SSH_HOST:/tmp/" &> /dev/null
    
    # Exécuter le remplacement sur le serveur
    ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "cat /tmp/formatted_prompt.py | python3 /tmp/replace_prompt.py $BACKEND_DIR/$BACKEND_FILE"
    
    log_success "Nouveau prompt déployé"
    
    # Nettoyage
    ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "rm /tmp/replace_prompt.py /tmp/formatted_prompt.py" &> /dev/null || true
}

# Fonction de redémarrage du service
restart_service() {
    log_info "Redémarrage du service backend..."
    
    # Essayer systemctl d'abord
    if ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "sudo systemctl restart $SERVICE_NAME 2>/dev/null"; then
        log_success "Service redémarré avec systemctl"
    # Sinon essayer la commande custom
    elif ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "$RESTART_COMMAND 2>/dev/null"; then
        log_success "Service redémarré avec commande custom"
    else
        log_warning "Impossible de redémarrer automatiquement le service"
        log_info "Redémarrez manuellement : $RESTART_COMMAND"
    fi
    
    # Attendre que le service redémarre
    log_info "Attente du redémarrage (5s)..."
    sleep 5
}

# Fonction de test de l'endpoint
test_endpoint() {
    log_info "Test de l'endpoint API..."
    
    local response=$(curl -s -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$TEST_MESSAGE\", \"conversation_history\": []}" 2>/dev/null)
    
    if [[ -z "$response" ]]; then
        log_warning "Pas de réponse de l'API"
        log_info "Vérifiez manuellement : curl -X POST $API_URL"
        return 1
    fi
    
    # Sauvegarder la réponse
    echo "$response" > test_response.json
    log_success "Réponse reçue - sauvegardée dans test_response.json"
    
    # Vérifier si la réponse contient des mots-clés scientifiques
    if echo "$response" | grep -qi "neurocognitif\|émotionnel\|cerveau\|fonction"; then
        log_success "✨ Le nouveau prompt scientifique semble actif !"
    else
        log_warning "La réponse ne contient pas de termes scientifiques typiques"
        log_info "Vérifiez test_response.json pour analyser la réponse"
    fi
}

# Fonction de rollback
rollback() {
    log_error "ROLLBACK : Restauration du backup..."
    
    local latest_backup=$(ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "ls -t $BACKUP_DIR/backup_* | head -1")
    
    if [[ -z "$latest_backup" ]]; then
        log_error "Aucun backup trouvé pour rollback"
        exit 1
    fi
    
    ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
        "cp $latest_backup $BACKEND_DIR/$BACKEND_FILE"
    
    restart_service
    log_success "Rollback effectué : $latest_backup"
}

# Fonction principale
main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║   🚀 DÉPLOIEMENT PROMPT SCIENTIFIQUE NOCTALIÆ           ║"
    echo "║   Basé sur les travaux d'Isabelle Arnulf                ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Étape 1 : Charger la configuration
    load_config "$1"
    
    # Étape 2 : Préparer le prompt
    prepare_prompt
    
    # Étape 3 : Test de connexion
    test_ssh_connection
    
    # Étape 4 : Localiser le backend
    locate_backend
    
    # Étape 5 : Créer un backup
    create_backup
    
    # Étape 6 : Extraire l'ancien prompt
    extract_old_prompt
    
    # Demander confirmation
    echo ""
    log_warning "Prêt à déployer le nouveau prompt scientifique"
    log_info "Backend : $BACKEND_DIR/$BACKEND_FILE"
    read -p "Continuer ? (o/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        log_info "Déploiement annulé"
        exit 0
    fi
    
    # Étape 7 : Déployer
    deploy_prompt
    
    # Étape 8 : Redémarrer le service
    restart_service
    
    # Étape 9 : Tester
    test_endpoint
    
    echo ""
    log_success "═══════════════════════════════════════════════════════"
    log_success "✨ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
    log_success "═══════════════════════════════════════════════════════"
    echo ""
    log_info "Prochaines étapes :"
    echo "  1. Testez l'app mobile avec plusieurs types de rêves"
    echo "  2. Vérifiez que les réponses sont scientifiques (pas symboliques)"
    echo "  3. En cas de problème : ./deploy.sh rollback"
    echo ""
}

# Gestion du rollback
if [[ "$1" == "rollback" ]]; then
    load_config "config.env"
    rollback
    exit 0
fi

# Exécution
main "$@"
