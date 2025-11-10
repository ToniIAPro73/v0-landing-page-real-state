/**
 * INSTRUCCIONES DE INTEGRACIÓN:
 * 
 * Agregar esto al FINAL del componente PlayaVivaLanding,
 * justo ANTES del return statement (alrededor de línea 1350)
 */

// Cargar script de reCAPTCHA Enterprise
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/enterprise.js?render=6LdVoAcsAAAAABmGUpMvdZoVrjje45Xbq62lT5sm';
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  return () => {
    // Cleanup: remover script cuando componente se desmonte
    const existingScript = document.querySelector(`script[src*="recaptcha/enterprise"]`);
    if (existingScript) {
      document.head.removeChild(existingScript);
    }
  };
}, []);
