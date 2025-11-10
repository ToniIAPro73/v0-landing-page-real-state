/**
 * INSTRUCCIONES DE INTEGRACIÓN:
 * 
 * REEMPLAZAR la función handleLeadSubmit actual (línea 1250-1348)
 * con esta versión actualizada que incluye reCAPTCHA Enterprise
 */

const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  if (isSubmitting) return;

  const urlParams = new URLSearchParams(window.location.search);
  const utmData: Record<string, string> = {
    utm_source: urlParams.get("utm_source") || "",
    utm_medium: urlParams.get("utm_medium") || "",
    utm_campaign: urlParams.get("utm_campaign") || "",
    utm_term: urlParams.get("utm_term") || "",
    utm_content: urlParams.get("utm_content") || "",
  };

  const trimmedFirstName = formData.firstName.trim();
  const trimmedLastName = formData.lastName.trim();
  const trimmedEmail = formData.email.trim();
  const fallbackName = language === "es" ? "inversor" : "investor";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validaciones
  if (!trimmedFirstName) {
    focusField(firstNameRef, "firstName", fieldErrorCopy.firstName);
    return;
  }

  if (!trimmedLastName) {
    focusField(lastNameRef, "lastName", fieldErrorCopy.lastName);
    return;
  }

  if (!trimmedEmail) {
    focusField(emailRef, "email", fieldErrorCopy.email);
    return;
  }

  if (!emailRegex.test(trimmedEmail)) {
    focusField(emailRef, "email", emailInvalidCopy);
    return;
  }

  // CAMBIO CRÍTICO: Ya no validamos checkbox de reCAPTCHA
  // reCAPTCHA Enterprise es invisible y se ejecuta automáticamente

  if (!privacyAccepted) {
    focusField(privacyRef, "privacy", fieldErrorCopy.privacy);
    return;
  }

  setIsSubmitting(true);
  setAutomationFeedback(null);
  setValidationMessage(null);

  try {
    // NUEVO: Ejecutar reCAPTCHA Enterprise de forma invisible
    const recaptchaToken = await new Promise<string>((resolve, reject) => {
      if (typeof grecaptcha === 'undefined' || !grecaptcha.enterprise) {
        reject(new Error('reCAPTCHA Enterprise no está cargado'));
        return;
      }

      grecaptcha.enterprise.ready(async () => {
        try {
          const token = await grecaptcha.enterprise.execute(
            '6LdVoAcsAAAAABmGUpMvdZoVrjje45Xbq62lT5sm',
            { action: 'DOSSIER_DOWNLOAD' }
          );
          resolve(token);
        } catch (error) {
          reject(error);
        }
      });
    });

    const dossierFileNameBase = `Playa-Viva-Dossier-${
      trimmedFirstName || "Investor"
    }-${trimmedLastName || "Lead"}`
      .trim()
      .replace(/\s+/g, "-");

    const leadData: LeadAutomationPayload = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      fullName: `${trimmedFirstName} ${trimmedLastName}`.trim(),
      email: trimmedEmail,
      language,
      page: "Playa Viva Landing",
      timestamp: new Date().toISOString(),
      dossierFileName: `${dossierFileNameBase}.pdf`,
      utm: utmData,
      workflow: "hubspot+python-dossier+internal-db",
      recaptchaToken, // NUEVO: Agregar token de reCAPTCHA
    };

    await orchestrateLeadAutomation(leadData);
    
    setAutomationFeedback({
      type: "success",
      userName: trimmedFirstName || fallbackName,
    });
    
    setFormData({ firstName: "", lastName: "", email: "" });
    setPrivacyAccepted(false);

    setTimeout(() => {
      setAutomationFeedback(null);
    }, 5000);
    
  } catch (error) {
    console.error("Lead automation failed", error);
    
    setAutomationFeedback({
      type: "error",
      userName: "",
    });

    setTimeout(() => {
      setAutomationFeedback(null);
    }, 5000);
    
  } finally {
    setIsSubmitting(false);
  }
};
