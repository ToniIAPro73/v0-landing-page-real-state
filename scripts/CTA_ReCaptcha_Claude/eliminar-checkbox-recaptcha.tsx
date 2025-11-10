/**
 * INSTRUCCIONES DE INTEGRACIÓN:
 * 
 * ELIMINAR O COMENTAR la sección del checkbox de reCAPTCHA
 * en el formulario (aproximadamente líneas 2817-2857)
 * 
 * Buscar esta sección y comentarla o eliminarla:
 */

{/* COMENTAR O ELIMINAR ESTA SECCIÓN COMPLETA */}
{/*
<div
  className={`rounded-2xl border px-4 py-3 bg-white/80 backdrop-blur-sm transition-all duration-200 ${
    validationMessage?.field === "recaptcha"
      ? "border-[#c07a50]"
      : "border-brown-dark/20"
  }`}
>
  <div className="flex items-center justify-between mb-2">
    <label className="flex items-center gap-3 cursor-pointer text-sm text-brown-dark/90">
      <input
        ref={recaptchaRef}
        type="checkbox"
        checked={isRecaptchaVerified}
        onChange={(e) => {
          setIsRecaptchaVerified(e.target.checked);
          if (validationMessage?.field === "recaptcha") {
            setValidationMessage(null);
          }
        }}
        aria-invalid={validationMessage?.field === "recaptcha"}
        className="h-5 w-5 rounded border-brown-dark/30 text-gold-warm focus:ring-gold-warm/40"
      />
      <span>
        {language === "es"
          ? "No soy un robot"
          : "I'm not a robot"}
      </span>
    </label>
    <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-tight text-brown-dark/60">
      <Bot className="h-4 w-4 text-gold-warm" />
      <span>reCAPTCHA</span>
    </div>
  </div>
  <p className="text-[11px] text-brown-dark/60 mt-2">
    {language === "es"
      ? "Verificación discreta para preservar la exclusividad del proceso."
      : "A discreet verification keeps the download flow exclusive."}
  </p>
</div>
*/}

/**
 * NOTA: reCAPTCHA Enterprise ahora es INVISIBLE
 * Se ejecuta automáticamente al enviar el formulario
 * No requiere interacción del usuario
 */
