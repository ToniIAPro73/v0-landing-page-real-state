# MIGRACIÓN: Google reCAPTCHA v3 → ALTCHA

## Plan de Implementación Paso a Paso

**Proyecto:** Landing Page Playa Viva  
**Fecha:** Noviembre 2025  
**Objetivo:** Reemplazar reCAPTCHA v3 con ALTCHA (open source, GDPR-friendly)

---

## FASE 1: PREPARACIÓN (30 minutos)

### Tarea 1.1: Investigar arquitectura ALTCHA

**Acción:**

- [ ] Revisar documentación oficial: https://altcha.org/docs
- [ ] Decidir método de implementación:
  - ☐ Self-hosted (máximo control, requiere backend)
  - ☐ Cloud service (más rápido, €9/mes después de free tier)

**Decisión recomendada:** Self-hosted (gratis, control total)

---

### Tarea 1.2: Instalar dependencias en backend

**Acción:**

**Si usas Node.js:**

```bash
npm install altcha
```

**Si usas Python:**

```bash
pip install altcha
```

**Verificación:**

```bash
# Node.js
node -e "console.log(require('altcha'))"

# Python
python -c "import altcha; print('OK')"
```

---

## FASE 2: CONFIGURACIÓN BACKEND (45 minutos)

### Tarea 2.1: Crear endpoint para generar challenges

**Acción:** Crear `/api/altcha/challenge`

**Código Node.js/Express:**

```javascript
const express = require("express");
const { createChallenge } = require("altcha");
const app = express();

// Configuración
const ALTCHA_SECRET = process.env.ALTCHA_SECRET || "your-secret-key-here";
const ALTCHA_EXPIRES = 300; // 5 minutos

// Endpoint para generar challenge
app.get("/api/altcha/challenge", (req, res) => {
  try {
    const challenge = createChallenge({
      hmacKey: ALTCHA_SECRET,
      number: Math.floor(Math.random() * 100000),
      expires: Date.now() + ALTCHA_EXPIRES * 1000,
    });

    res.json(challenge);
  } catch (error) {
    console.error("Error creating ALTCHA challenge:", error);
    res.status(500).json({ error: "Failed to create challenge" });
  }
});
```

**Código Python/Flask:**

```python
from flask import Flask, jsonify
from altcha import create_challenge
import os
import time
import random

app = Flask(__name__)

ALTCHA_SECRET = os.getenv('ALTCHA_SECRET', 'your-secret-key-here')
ALTCHA_EXPIRES = 300  # 5 minutos

@app.route('/api/altcha/challenge', methods=['GET'])
def get_challenge():
    try:
        challenge = create_challenge(
            hmac_key=ALTCHA_SECRET,
            number=random.randint(0, 100000),
            expires=int(time.time() * 1000) + (ALTCHA_EXPIRES * 1000)
        )
        return jsonify(challenge)
    except Exception as e:
        print(f'Error creating ALTCHA challenge: {e}')
        return jsonify({'error': 'Failed to create challenge'}), 500
```

**Verificación:**

```bash
curl http://localhost:3000/api/altcha/challenge

# Debe devolver:
{
  "algorithm": "SHA-256",
  "challenge": "...",
  "salt": "...",
  "signature": "..."
}
```

---

### Tarea 2.2: Modificar endpoint de submit para verificar ALTCHA

**Acción:** Actualizar `/api/submit-lead`

**Código Node.js/Express:**

```javascript
const { verifyServerSignature } = require("altcha");

app.post("/api/submit-lead", async (req, res) => {
  // 1. Extraer datos
  const {
    altcha_payload, // ← Nuevo: payload de ALTCHA
    firstname,
    lastname,
    email,
    // ... resto de campos
  } = req.body;

  // 2. VERIFICAR ALTCHA (NUEVO)
  try {
    const isValid = await verifyServerSignature(altcha_payload, ALTCHA_SECRET);

    if (!isValid) {
      console.warn("❌ ALTCHA verification failed");
      return res.status(400).json({
        success: false,
        message: "CAPTCHA verification failed",
      });
    }

    console.log("✅ ALTCHA verified");
  } catch (error) {
    console.error("❌ ALTCHA error:", error);
    return res.status(400).json({
      success: false,
      message: "CAPTCHA verification error",
    });
  }

  // 3. Continuar con submit a HubSpot (código existente)
  // ... tu código actual de HubSpot aquí ...
});
```

**Código Python/Flask:**

```python
from altcha import verify_server_signature

@app.route('/api/submit-lead', methods=['POST'])
def submit_lead():

    # 1. Extraer datos
    altcha_payload = request.form.get('altcha_payload')
    firstname = request.form.get('firstname')
    lastname = request.form.get('lastname')
    email = request.form.get('email')
    # ... resto de campos

    # 2. VERIFICAR ALTCHA (NUEVO)
    try:
        is_valid = verify_server_signature(
            altcha_payload,
            ALTCHA_SECRET
        )

        if not is_valid:
            print('❌ ALTCHA verification failed')
            return jsonify({
                'success': False,
                'message': 'CAPTCHA verification failed'
            }), 400

        print('✅ ALTCHA verified')

    except Exception as e:
        print(f'❌ ALTCHA error: {e}')
        return jsonify({
            'success': False,
            'message': 'CAPTCHA verification error'
        }), 400

    # 3. Continuar con submit a HubSpot (código existente)
    # ... tu código actual aquí ...
```

**Verificación:**

```bash
# Test con payload inválido (debe fallar)
curl -X POST http://localhost:3000/api/submit-lead \
  -d "altcha_payload=invalid" \
  -d "email=test@test.com"

# Debe devolver error 400
```

---

## FASE 3: FRONTEND - QUITAR RECAPTCHA (15 minutos)

### Tarea 3.1: Eliminar scripts de reCAPTCHA

**Acción:**

**Buscar y eliminar:**

```html
<!-- ELIMINAR ESTO -->
<script src="https://www.google.com/recaptcha/api.js"></script>
<script>
  grecaptcha.ready(function() {
    grecaptcha.execute('YOUR_SITE_KEY', {action: 'submit'})...
  });
</script>
```

**Buscar en archivos:**

```bash
# Encontrar referencias a reCAPTCHA
grep -r "recaptcha" . --include="*.html" --include="*.js"
grep -r "grecaptcha" . --include="*.html" --include="*.js"
```

---

### Tarea 3.2: Eliminar lógica de reCAPTCHA del formulario

**Acción:**

**Eliminar código JavaScript:**

```javascript
// ELIMINAR TODO ESTO:

// Obtener token de reCAPTCHA
grecaptcha.ready(function () {
  grecaptcha
    .execute("YOUR_SITE_KEY", { action: "submit" })
    .then(function (token) {
      formData.append("g-recaptcha-response", token);
      // ...
    });
});
```

---

## FASE 4: FRONTEND - INTEGRAR ALTCHA (30 minutos)

### Tarea 4.1: Añadir widget de ALTCHA al HTML

**Acción:**

**Añadir script CDN:**

```html
<!-- Añadir en <head> o antes de </body> -->
<script
  type="module"
  src="https://cdn.jsdelivr.net/npm/altcha/dist/altcha.min.js"
></script>
```

**Añadir widget en formulario:**

```html
<form id="leadForm" method="POST" action="/api/submit-lead">
  <!-- Campos existentes -->
  <input type="text" name="firstname" required />
  <input type="email" name="email" required />
  <!-- ... -->

  <!-- NUEVO: Widget ALTCHA -->
  <altcha-widget
    challengeurl="/api/altcha/challenge"
    name="altcha_payload"
    style="margin: 20px 0;"
  ></altcha-widget>

  <button type="submit">Enviar</button>
</form>
```

**Verificación:**

```text
1. Abrir página en navegador
2. Debe aparecer widget ALTCHA (pequeño box con "Verifying...")
3. Después de 1-2 segundos: ✓ Verified
```

---

### Tarea 4.2: Actualizar JavaScript de submit

**Acción:**

**Código actualizado:**

```javascript
document
  .getElementById("leadForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    // ALTCHA se incluye automáticamente en formData
    // No requiere código extra

    // Verificar que ALTCHA esté presente
    const altchaPayload = formData.get("altcha_payload");
    if (!altchaPayload) {
      alert("Por favor completa la verificación");
      return;
    }

    console.log("✓ ALTCHA payload:", altchaPayload);

    // Enviar formulario
    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = "/gracias";
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar formulario");
    }
  });
```

---

### Tarea 4.3: Personalizar apariencia (opcional)

**Acción:**

**Estilos CSS:**

```css
altcha-widget {
  margin: 20px 0;
  display: block;
}

/* Personalizar colores */
altcha-widget::part(container) {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

altcha-widget::part(label) {
  font-size: 14px;
  color: #333;
}
```

**Atributos del widget:**

```html
<altcha-widget
  challengeurl="/api/altcha/challenge"
  name="altcha_payload"
  hidefooter="false"
  hidelogo="false"
  strings='{"label":"Verificando...","verified":"✓ Verificado"}'
></altcha-widget>
```

---

## FASE 5: VARIABLES DE ENTORNO (10 minutos)

### Tarea 5.1: Configurar secret key

**Acción:**

**Crear `.env` file:**

```bash
# Generar secret aleatorio
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# O en Python
python -c "import secrets; print(secrets.token_hex(32))"
```

**Añadir a `.env`:**

```bash
ALTCHA_SECRET=tu_secret_key_aqui_64_caracteres
```

**Verificar en código:**

```javascript
// Node.js
require("dotenv").config();
const ALTCHA_SECRET = process.env.ALTCHA_SECRET;

if (!ALTCHA_SECRET) {
  throw new Error("ALTCHA_SECRET not configured");
}
```

---

## FASE 6: TESTING (30 minutos)

### Tarea 6.1: Test local - Flujo completo

**Acción:**

- [ ] Abrir landing page en localhost
- [ ] Verificar que widget ALTCHA aparece
- [ ] Esperar a que muestre "✓ Verified"
- [ ] Llenar formulario con datos de prueba
- [ ] Submit formulario
- [ ] Verificar en logs backend: "✅ ALTCHA verified"
- [ ] Confirmar que lead llega a HubSpot

**Checklist:**

```text
✓ Widget aparece correctamente
✓ Verifica en 1-3 segundos
✓ Submit funciona
✓ Backend valida correctamente
✓ Lead llega a HubSpot con todos los datos
✓ No hay errores en consola
```

---

### Tarea 6.2: Test de seguridad - Bypass attempt

**Acción:**

### Test 1: Submit sin ALTCHA

```bash
curl -X POST http://localhost:3000/api/submit-lead \
  -d "email=test@test.com" \
  -d "firstname=Test"

# Debe devolver: 400 Bad Request
```

### Test 2: Submit con payload inválido

```bash
curl -X POST http://localhost:3000/api/submit-lead \
  -d "altcha_payload=fake_payload" \
  -d "email=test@test.com"

# Debe devolver: 400 Bad Request
```

### Test 3: Reusar payload antiguo

- Submit formulario 2 veces con mismo payload
- Segunda vez debe fallar (payload expirado o usado)

---

### Tarea 6.3: Test de UX - Diferentes browsers

**Acción:**

- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

**Verificar:**

- Widget se ve correctamente
- Verifica en tiempo razonable (< 5 segundos)
- No bloquea el formulario

---

## FASE 7: DEPLOYMENT (20 minutos)

### Tarea 7.1: Configurar variables en producción

**Acción:**

**Vercel/Netlify:**

```bash
# Via CLI
vercel env add ALTCHA_SECRET

# Via Web UI
Settings → Environment Variables
→ Add: ALTCHA_SECRET = tu_secret_aqui
```

**Heroku:**

```bash
heroku config:set ALTCHA_SECRET=tu_secret_aqui
```

**Verificación:**

```bash
# Verificar que existe
vercel env ls
# o
heroku config
```

---

### Tarea 7.2: Deploy a staging

**Acción:**

```bash
# Git commit
git add .
git commit -m "feat: migrate from reCAPTCHA v3 to ALTCHA"

# Deploy a staging branch
git push origin staging

# O deploy directo
vercel --prod
```

**Verificación:**

```bash
# Test en staging URL
curl https://staging.playaviva-invest.es/api/altcha/challenge

# Debe devolver challenge válido
```

---

### Tarea 7.3: Test en staging

**Acción:**

- [ ] Abrir URL staging
- [ ] Completar formulario real
- [ ] Verificar lead en HubSpot
- [ ] Revisar logs de servidor
- [ ] Confirmar todo OK

---

### Tarea 7.4: Deploy a producción

**Acción:**

```bash
# Merge a main
git checkout main
git merge staging
git push origin main

# Auto-deploy o manual
vercel --prod
```

**Anuncio:**

```text
🎉 ALTCHA implementado en producción
- reCAPTCHA v3 eliminado
- GDPR compliant
- Zero tracking
- Experiencia de usuario mejorada
```

---

## FASE 8: MONITOREO POST-DEPLOY (Primera semana)

### Tarea 8.1: Monitorear logs

**Acción:**

```bash
# Cada día durante la primera semana
vercel logs --follow

# Buscar:
# - ✅ ALTCHA verified (confirmaciones exitosas)
# - ❌ ALTCHA verification failed (intentos de spam)
```

**Métricas a seguir:**

- Tasa de verificación exitosa (> 98%)
- Tasa de fallos (< 2%)
- Tiempo de verificación (< 5 segundos)

---

### Tarea 8.2: Comparar métricas con reCAPTCHA

**Acción:**

**Crear tabla comparativa:**

```tab
| Métrica              | reCAPTCHA v3 | ALTCHA |
|----------------------|--------------|--------|
| Conversion rate      | X%           | Y%     |
| Spam submissions     | N            | M      |
| User complaints      | A            | B      |
| Page load time       | Xms          | Yms    |
```

---

## ROLLBACK PLAN (Si algo falla)

### Opción 1: Rollback inmediato

```bash
# Revertir último commit
git revert HEAD
git push origin main

# O rollback en Vercel
vercel rollback
```

### Opción 2: Mantener ambos temporalmente

```javascript
// Verificar reCAPTCHA O ALTCHA
const recaptchaToken = req.body["g-recaptcha-response"];
const altchaPayload = req.body["altcha_payload"];

if (altchaPayload) {
  // Verificar ALTCHA
  isValid = await verifyALTCHA(altchaPayload);
} else if (recaptchaToken) {
  // Verificar reCAPTCHA (fallback)
  isValid = await verifyRecaptcha(recaptchaToken);
} else {
  return error("No CAPTCHA provided");
}
```

---

## CHECKLIST FINAL

**Pre-deployment:**

- [ ] ALTCHA backend endpoint funciona
- [ ] ALTCHA widget renderiza correctamente
- [ ] Verificación funciona en backend
- [ ] Tests pasan (submit exitoso + fallos detectados)
- [ ] Secret key configurado en .env
- [ ] reCAPTCHA completamente eliminado

**Post-deployment:**

- [ ] Widget visible en producción
- [ ] Submit funciona end-to-end
- [ ] Leads llegan a HubSpot
- [ ] No errores en logs
- [ ] No quejas de usuarios
- [ ] Métricas monitoreadas primera semana

---

## RECURSOS

**Documentación:**

- ALTCHA Docs: https://altcha.org/docs
- ALTCHA GitHub: https://github.com/altcha-org/altcha
- NPM Package: https://www.npmjs.com/package/altcha

**Soporte:**

- GitHub Issues: https://github.com/altcha-org/altcha/issues
- Community: https://altcha.org/community

---

**Tiempo estimado total:** 3-4 horas  
**Complejidad:** Media  
**Riesgo:** Bajo (fácil rollback)

---

**INICIO:** [ Fecha ]  
**FINALIZACIÓN:** [ Fecha ]  
**RESPONSABLE:** Antonio Ballesteros
