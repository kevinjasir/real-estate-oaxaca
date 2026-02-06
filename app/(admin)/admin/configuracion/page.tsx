"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

interface WhatsAppConfig {
  number: string;
  message_template: string;
  business_hours_start: string;
  business_hours_end: string;
  auto_reply_enabled: boolean;
  auto_reply_message: string;
}

interface ContactConfig {
  email: string;
}

interface BannerConfig {
  image: string;
  title: string;
  subtitle: string;
}

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [config, setConfig] = useState<WhatsAppConfig>({
    number: "",
    message_template: "",
    business_hours_start: "09:00",
    business_hours_end: "18:00",
    auto_reply_enabled: false,
    auto_reply_message: "",
  });

  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({
    image: "",
    title: "Nuestros Proyectos",
    subtitle: "Descubre los mejores desarrollos de terrenos en la costa de Oaxaca.",
  });
  const [savingBanner, setSavingBanner] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [contactConfig, setContactConfig] = useState<ContactConfig>({
    email: "",
  });
  const [savingContact, setSavingContact] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadConfig();
    loadBannerConfig();
    loadContactConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "whatsapp_general")
        .single();

      if (data && !error) {
        const value = data.value as unknown as WhatsAppConfig;
        setConfig({
          number: value?.number || "",
          message_template: value?.message_template || "",
          business_hours_start: value?.business_hours_start || "09:00",
          business_hours_end: value?.business_hours_end || "18:00",
          auto_reply_enabled: value?.auto_reply_enabled || false,
          auto_reply_message: value?.auto_reply_message || "",
        });
      }
    } catch (err) {
      console.error("Error loading config:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadBannerConfig = async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["projects_banner_image", "projects_banner_title", "projects_banner_subtitle"]);

      if (data) {
        const newConfig = { ...bannerConfig };
        data.forEach((item) => {
          const value = typeof item.value === "string" ? item.value.replace(/^"|"$/g, "") : String(item.value).replace(/^"|"$/g, "");
          if (item.key === "projects_banner_image") newConfig.image = value;
          if (item.key === "projects_banner_title") newConfig.title = value;
          if (item.key === "projects_banner_subtitle") newConfig.subtitle = value;
        });
        setBannerConfig(newConfig);
      }
    } catch (err) {
      console.error("Error loading banner config:", err);
    }
  };

  const loadContactConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "contact_email")
        .single();

      if (data && !error) {
        const value = data.value as unknown as ContactConfig;
        setContactConfig({
          email: value?.email || "",
        });
      } else {
        // Try to get email from super_admin user
        const { data: adminUser } = await supabase
          .from("users")
          .select("email")
          .eq("role", "super_admin")
          .single();

        if (adminUser?.email) {
          setContactConfig({ email: adminUser.email });
        }
      }
    } catch (err) {
      console.error("Error loading contact config:", err);
    }
  };

  const handleSaveContact = async () => {
    setSavingContact(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "contact_email",
          value: contactConfig as unknown as null,
          description: "Correo electrónico de contacto",
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      setMessage({ type: "success", text: "Correo de contacto guardado exitosamente" });
    } catch (err) {
      console.error("Error saving contact config:", err);
      setMessage({ type: "error", text: "Error al guardar el correo de contacto" });
    } finally {
      setSavingContact(false);
    }
  };

  const handleBannerImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingBanner(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `banners/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("project-images")
        .getPublicUrl(data.path);

      setBannerConfig({ ...bannerConfig, image: urlData.publicUrl });
    } catch (err) {
      console.error("Error uploading banner image:", err);
      setMessage({ type: "error", text: "Error al subir la imagen" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSaveBanner = async () => {
    setSavingBanner(true);
    setMessage(null);

    try {
      // Save each setting
      const settings = [
        { key: "projects_banner_image", value: JSON.stringify(bannerConfig.image), description: "Background image for projects page hero banner" },
        { key: "projects_banner_title", value: JSON.stringify(bannerConfig.title), description: "Title for projects page hero banner" },
        { key: "projects_banner_subtitle", value: JSON.stringify(bannerConfig.subtitle), description: "Subtitle for projects page hero banner" },
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(setting, { onConflict: "key" });

        if (error) throw error;
      }

      setMessage({ type: "success", text: "Banner actualizado exitosamente" });
    } catch (err) {
      console.error("Error saving banner config:", err);
      setMessage({ type: "error", text: "Error al guardar el banner" });
    } finally {
      setSavingBanner(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "whatsapp_general",
          value: config as unknown as null,
          description: "Configuración de WhatsApp Business",
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      setMessage({ type: "success", text: "Configuración guardada exitosamente" });
    } catch (err) {
      console.error("Error saving config:", err);
      setMessage({ type: "error", text: "Error al guardar la configuración" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Administra la configuración del sistema</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* WhatsApp Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">WhatsApp Business</h2>
              <p className="text-sm text-gray-500">Configura tu número y mensajes de WhatsApp</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de WhatsApp
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">+</span>
              <input
                type="text"
                value={config.number}
                onChange={(e) => setConfig({ ...config, number: e.target.value })}
                placeholder="52 951 123 4567"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <p className="mt-1.5 text-sm text-gray-500">
              Incluye el código de país sin el símbolo +. Ejemplo: 529511234567
            </p>
          </div>

          {/* Default Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje predeterminado
            </label>
            <textarea
              value={config.message_template}
              onChange={(e) => setConfig({ ...config, message_template: e.target.value })}
              rows={3}
              placeholder="Hola, me interesa recibir información sobre sus terrenos..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="mt-1.5 text-sm text-gray-500">
              Este mensaje se pre-llenará cuando los usuarios hagan clic en WhatsApp
            </p>
          </div>

          {/* Business Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario de atención
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">De</span>
                <input
                  type="time"
                  value={config.business_hours_start}
                  onChange={(e) => setConfig({ ...config, business_hours_start: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">a</span>
                <input
                  type="time"
                  value={config.business_hours_end}
                  onChange={(e) => setConfig({ ...config, business_hours_end: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Auto Reply */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Respuesta automática</h3>
                <p className="text-sm text-gray-500">Mensaje fuera de horario de atención</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, auto_reply_enabled: !config.auto_reply_enabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.auto_reply_enabled ? "bg-emerald-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.auto_reply_enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {config.auto_reply_enabled && (
              <textarea
                value={config.auto_reply_message}
                onChange={(e) => setConfig({ ...config, auto_reply_message: e.target.value })}
                rows={3}
                placeholder="Gracias por contactarnos. Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00. Te responderemos a la brevedad."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </span>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
      {/* Contact Email Configuration */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Correo de Contacto</h2>
              <p className="text-sm text-gray-500">Configura el email que se mostrará en el sitio</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={contactConfig.email}
              onChange={(e) => setContactConfig({ ...contactConfig, email: e.target.value })}
              placeholder="contacto@ejemplo.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="mt-1.5 text-sm text-gray-500">
              Este correo se mostrará en el footer y la página de contacto
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSaveContact}
            disabled={savingContact}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {savingContact ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </span>
            ) : (
              "Guardar correo"
            )}
          </button>
        </div>
      </div>

      {/* Projects Banner Configuration */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Banner de Proyectos</h2>
              <p className="text-sm text-gray-500">Personaliza el encabezado de la página de proyectos</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Banner Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vista previa</label>
            <div className="relative h-40 rounded-lg overflow-hidden bg-gray-200">
              {bannerConfig.image ? (
                <Image
                  src={bannerConfig.image}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-emerald-950" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
              <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{bannerConfig.title || "Título"}</h3>
                  <p className="text-sm text-gray-200">{bannerConfig.subtitle || "Subtítulo"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Banner Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de fondo</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleBannerImageUpload(e.target.files[0])}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                {uploadingBanner ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Subir imagen</span>
                  </>
                )}
              </label>
              <span className="text-sm text-gray-500">o</span>
              <input
                type="url"
                value={bannerConfig.image}
                onChange={(e) => setBannerConfig({ ...bannerConfig, image: e.target.value })}
                placeholder="https://..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            <p className="mt-1.5 text-sm text-gray-500">Sube una imagen o pega la URL de una imagen externa</p>
          </div>

          {/* Banner Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input
              type="text"
              value={bannerConfig.title}
              onChange={(e) => setBannerConfig({ ...bannerConfig, title: e.target.value })}
              placeholder="Nuestros Proyectos"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Banner Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
            <textarea
              value={bannerConfig.subtitle}
              onChange={(e) => setBannerConfig({ ...bannerConfig, subtitle: e.target.value })}
              rows={2}
              placeholder="Descubre los mejores desarrollos de terrenos en la costa de Oaxaca..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Save Banner Button */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleSaveBanner}
            disabled={savingBanner}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {savingBanner ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </span>
            ) : (
              "Guardar banner"
            )}
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Otras configuraciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/configuracion/permisos"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                  Permisos por Rol
                </h3>
                <p className="text-sm text-gray-500">Ver qué puede hacer cada tipo de usuario</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
