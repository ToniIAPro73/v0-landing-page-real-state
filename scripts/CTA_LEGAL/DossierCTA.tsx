'use client';

import { useState } from 'react';
import Script from 'next/script';

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  privacyPolicy: boolean;
  marketingConsent: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function DossierCTA() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    privacyPolicy: false,
    marketingConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validación de campos
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.privacyPolicy) {
      newErrors.privacyPolicy = 'Debes aceptar la Política de Privacidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de cambios en input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpiar error del campo modificado
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Manejo de sumisión del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Hacer scroll al primer error
      const firstErrorField = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorField);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    try {
      // Obtener token de reCAPTCHA
      const recaptchaToken = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '',
        { action: 'submit' }
      );

      // Enviar datos al backend
      const response = await fetch('/api/dossier-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
          source: 'landing_playa_viva',
          utm_campaign: '237663446-Playa%20Viva',
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setSuccessMessage(
          '¡Gracias! Tu dossier exclusivo está en camino. Revisa tu email en los próximos minutos.'
        );

        // Resetear formulario
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          privacyPolicy: false,
          marketingConsent: false,
        });

        // Tracking evento en HubSpot
        if (typeof window._hsq !== 'undefined') {
          window._hsq.push(['trackEvent', {
            id: 'dossier_download',
            value: 'playa_viva'
          }]);
        }
      } else {
        setErrors({ submit: data.error || 'Error al enviar el formulario' });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Error de conexión. Por favor intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* reCAPTCHA v3 Script */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        strategy="afterInteractive"
      />

      <div className="dossier-cta-container">
        {submitted ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>¡Solicitud Recibida!</h3>
            <p>{successMessage}</p>
          </div>
        ) : (
          <div className="dossier-card">
            <div className="card-header">
              <h2>Descarga el Dossier Exclusivo</h2>
              <p className="subtitle">
                Información completa sobre rentabilidades, planos y oportunidades de inversión
              </p>
            </div>

            <form onSubmit={handleSubmit} className="dossier-form">
              {/* Campo Nombre */}
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre completo <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Juan Pérez García"
                  className={errors.nombre ? 'error' : ''}
                  disabled={loading}
                />
                {errors.nombre && <span className="error-text">{errors.nombre}</span>}
              </div>

              {/* Campo Email */}
              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {/* Campo Teléfono (Opcional) */}
              <div className="form-group">
                <label htmlFor="telefono">Teléfono (opcional)</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+34 600 000 000"
                  disabled={loading}
                />
              </div>

              {/* Checkboxes de Consentimiento */}
              <div className="consent-section">
                {/* Check 1: Política de Privacidad (OBLIGATORIO) */}
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="privacyPolicy"
                    name="privacyPolicy"
                    checked={formData.privacyPolicy}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="privacyPolicy" className="checkbox-label">
                    <span className="required">*</span> Acepto la{' '}
                    <a
                      href="/politica-privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Política de Privacidad
                    </a>{' '}
                    y autorizo la transferencia internacional de datos (TID) a HubSpot Inc. (EE.UU.)
                    para gestionar mi solicitud.
                  </label>
                </div>
                {errors.privacyPolicy && (
                  <span className="error-text">{errors.privacyPolicy}</span>
                )}

                {/* Check 2: Marketing (OPCIONAL) */}
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label htmlFor="marketingConsent" className="checkbox-label">
                    Deseo recibir comunicaciones comerciales de Uniestate sobre oportunidades de
                    inversión.
                  </label>
                </div>

                {/* Información GDPR */}
                <div className="gdpr-info">
                  <p>
                    <strong>Responsable:</strong> Uniestate UK Ltd. | <strong>Finalidad:</strong>{' '}
                    Envío de dossier y seguimiento comercial | <strong>Legitimación:</strong>{' '}
                    Consentimiento | <strong>Destinatarios:</strong> HubSpot Inc. (EE.UU., Privacy
                    Shield) | <strong>Derechos:</strong> Acceso, rectificación, supresión,
                    oposición en{' '}
                    <a href="mailto:privacy@uniestate.co.uk">privacy@uniestate.co.uk</a>
                  </p>
                </div>
              </div>

              {/* Error general de sumisión */}
              {errors.submit && (
                <div className="alert-error">
                  <strong>Error:</strong> {errors.submit}
                </div>
              )}

              {/* Botón de envío */}
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span> Enviando...
                  </>
                ) : (
                  <>Descargar Dossier Gratuito</>
                )}
              </button>

              {/* Texto de reCAPTCHA */}
              <p className="recaptcha-text">
                Protegido por reCAPTCHA de Google. Aplican la{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  Política de Privacidad
                </a>{' '}
                y los{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
                  Términos de Servicio
                </a>
                .
              </p>
            </form>
          </div>
        )}
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .dossier-cta-container {
          padding: 60px 20px;
          background: linear-gradient(135deg, #f5f0e8 0%, #faf8f3 100%);
        }

        .dossier-card {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        .card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .card-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          color: #2c2c2c;
          margin-bottom: 12px;
          font-weight: 700;
        }

        .subtitle {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2c2c2c;
          font-size: 14px;
        }

        .required {
          color: #d4af37;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.3s ease;
          font-family: 'Lato', sans-serif;
        }

        .form-group input:focus {
          outline: none;
          border-color: #d4af37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .form-group input.error {
          border-color: #e74c3c;
        }

        .form-group input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .error-text {
          display: block;
          color: #e74c3c;
          font-size: 13px;
          margin-top: 6px;
        }

        .consent-section {
          background: #fafafa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .checkbox-group {
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .checkbox-group input[type='checkbox'] {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .checkbox-label {
          font-size: 14px;
          line-height: 1.6;
          color: #444;
          cursor: pointer;
        }

        .checkbox-label a {
          color: #d4af37;
          text-decoration: underline;
        }

        .gdpr-info {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }

        .gdpr-info p {
          font-size: 12px;
          line-height: 1.6;
          color: #666;
        }

        .gdpr-info a {
          color: #d4af37;
          text-decoration: none;
        }

        .alert-error {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .submit-button {
          width: 100%;
          background: linear-gradient(135deg, #d4af37 0%, #c4a037 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #c4a037 0%, #b49027 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .recaptcha-text {
          text-align: center;
          font-size: 11px;
          color: #999;
          margin-top: 16px;
          line-height: 1.4;
        }

        .recaptcha-text a {
          color: #d4af37;
          text-decoration: none;
        }

        .success-message {
          text-align: center;
          padding: 60px 20px;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #d4af37 0%, #c4a037 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          margin: 0 auto 24px;
        }

        .success-message h3 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #2c2c2c;
          margin-bottom: 12px;
        }

        .success-message p {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dossier-card {
            padding: 24px;
          }

          .card-header h2 {
            font-size: 24px;
          }

          .checkbox-label {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}
