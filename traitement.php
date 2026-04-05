<?php
// Configuration de l'email
$destinataire = 'ermentreprise.1@gmail.com';
$sujet_email = 'Nouveau message depuis le site ERM International';

// Headers pour l'email
$headers = "From: contact@erminternational.com\r\n";
$headers .= "Reply-To: " . filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) . "\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Fonction de nettoyage des données
function nettoyer_donnees($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Fonction de validation email
function valider_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Vérification que le formulaire a été soumis
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Récupération et nettoyage des données
    $nom = isset($_POST['nom']) ? nettoyer_donnees($_POST['nom']) : '';
    $email = isset($_POST['email']) ? nettoyer_donnees($_POST['email']) : '';
    $sujet = isset($_POST['sujet']) ? nettoyer_donnees($_POST['sujet']) : '';
    $message = isset($_POST['message']) ? nettoyer_donnees($_POST['message']) : '';

    // Validation des données
    $erreurs = array();

    if (empty($nom)) {
        $erreurs[] = "Le nom est requis.";
    }

    if (empty($email) || !valider_email($email)) {
        $erreurs[] = "Une adresse email valide est requise.";
    }

    if (empty($sujet)) {
        $erreurs[] = "Le sujet est requis.";
    }

    if (empty($message)) {
        $erreurs[] = "Le message est requis.";
    }

    // Si pas d'erreurs, envoyer l'email
    if (empty($erreurs)) {

        // Construction du corps de l'email
        $corps_email = "
        <html>
        <head>
            <title>Nouveau message de contact</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #22c55e; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #22c55e; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h2>🔔 Nouveau message depuis votre site web</h2>
                    <p>ERM International Group</p>
                </div>
                <div class='content'>
                    <div class='field'>
                        <span class='label'>Nom complet :</span><br>
                        " . htmlspecialchars($nom) . "
                    </div>
                    <div class='field'>
                        <span class='label'>Adresse email :</span><br>
                        <a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a>
                    </div>
                    <div class='field'>
                        <span class='label'>Sujet :</span><br>
                        " . htmlspecialchars($sujet) . "
                    </div>
                    <div class='field'>
                        <span class='label'>Message :</span><br>
                        " . nl2br(htmlspecialchars($message)) . "
                    </div>
                    <div class='field'>
                        <span class='label'>Date d'envoi :</span><br>
                        " . date('d/m/Y H:i:s') . "
                    </div>
                </div>
                <div class='footer'>
                    <p>Ce message a été envoyé automatiquement depuis le formulaire de contact de votre site web.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        // Sujet de l'email avec le sujet du formulaire
        $sujet_complet = $sujet_email . " - " . $sujet;

        // Envoi de l'email
        if (mail($destinataire, $sujet_complet, $corps_email, $headers)) {
            // Redirection vers la page de contact avec un paramètre de succès
            header("Location: contact.html?status=success");
            exit();
        } else {
            // Erreur d'envoi
            header("Location: contact.html?status=error");
            exit();
        }

    } else {
        // Erreurs de validation
        $erreur_message = implode("\\n", $erreurs);
        header("Location: contact.html?status=validation_error&message=" . urlencode($erreur_message));
        exit();
    }

} else {
    // Accès direct au fichier PHP (pas via POST)
    header("Location: contact.html");
    exit();
}
?>