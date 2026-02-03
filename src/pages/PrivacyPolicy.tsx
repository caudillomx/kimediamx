import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, Mail, MapPin } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-coral mb-6">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Aviso de Privacidad
              </h1>
              <p className="text-muted-foreground">
                Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <div className="bg-card rounded-2xl border border-border p-8 md:p-12 space-y-8">
                
                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    1. Identidad del Responsable
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">KiMedia</strong> (en adelante "nosotros" o "la empresa"), 
                    con domicilio en Ciudad de México, México, es responsable del tratamiento de los datos 
                    personales que nos proporcione, los cuales serán protegidos conforme a lo dispuesto por 
                    la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    2. Datos Personales que Recabamos
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Para las finalidades señaladas en el presente aviso de privacidad, podemos recabar 
                    los siguientes datos personales:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Nombre completo</li>
                    <li>Correo electrónico</li>
                    <li>Número de teléfono</li>
                    <li>Nombre de la empresa (en caso de aplicar)</li>
                    <li>Información proporcionada en formularios de contacto y diagnósticos</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    3. Finalidades del Tratamiento
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Los datos personales que recabamos serán utilizados para las siguientes finalidades:
                  </p>
                  <h3 className="font-semibold text-foreground mt-4 mb-2">Finalidades primarias:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Proporcionar los servicios y/o productos solicitados</li>
                    <li>Dar seguimiento a consultas y solicitudes de información</li>
                    <li>Enviar resultados de diagnósticos y evaluaciones</li>
                    <li>Proporcionar acceso a guías y contenido educativo</li>
                  </ul>
                  <h3 className="font-semibold text-foreground mt-4 mb-2">Finalidades secundarias:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Enviar información promocional sobre nuestros servicios</li>
                    <li>Realizar encuestas de satisfacción</li>
                    <li>Estadísticas y análisis internos</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    4. Transferencia de Datos
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Le informamos que sus datos personales no serán compartidos con terceros, salvo 
                    en los casos expresamente previstos en la Ley. Utilizamos servicios de terceros 
                    para el almacenamiento seguro de datos y envío de comunicaciones, los cuales 
                    cuentan con políticas de privacidad que garantizan la protección de su información.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    5. Derechos ARCO
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los 
                    utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho 
                    solicitar la corrección de su información personal en caso de que esté desactualizada, 
                    sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros 
                    o bases de datos cuando considere que la misma no está siendo utilizada conforme a 
                    los principios, deberes y obligaciones previstas en la normativa (Cancelación); así 
                    como oponerse al uso de sus datos personales para fines específicos (Oposición).
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Para ejercer cualquiera de los derechos ARCO, puede enviar una solicitud al correo 
                    electrónico indicado en la sección de contacto.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    6. Uso de Cookies
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Nuestro sitio web puede utilizar cookies y tecnologías similares para mejorar su 
                    experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido. 
                    Usted puede configurar su navegador para rechazar todas las cookies o para que le 
                    avise cuando se envía una cookie.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    7. Cambios al Aviso de Privacidad
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    El presente aviso de privacidad puede sufrir modificaciones, cambios o actualizaciones 
                    derivadas de nuevos requerimientos legales, de nuestras propias necesidades por los 
                    productos o servicios que ofrecemos, de nuestras prácticas de privacidad, o por otras 
                    causas. Nos comprometemos a mantenerlo informado sobre los cambios que pueda sufrir 
                    el presente aviso de privacidad a través de nuestro sitio web.
                  </p>
                </section>

                <section>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                    8. Contacto
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Si tiene alguna pregunta sobre este aviso de privacidad o sobre el tratamiento de 
                    sus datos personales, puede contactarnos a través de:
                  </p>
                  <div className="flex flex-col gap-3">
                    <a 
                      href="mailto:hola@kimedia.mx" 
                      className="inline-flex items-center gap-2 text-coral hover:text-coral/80 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      hola@kimedia.mx
                    </a>
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-5 h-5" />
                      Ciudad de México, México
                    </span>
                  </div>
                </section>

              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
