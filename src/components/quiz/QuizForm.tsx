import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, User, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Ingresa un email válido").max(255),
  phone: z.string().optional(),
});

const pymeSchema = baseSchema.extend({
  companyName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres").max(100),
});

interface QuizFormProps {
  quizType: "personal_brand" | "pyme";
  onSubmit: (data: { name: string; email: string; phone?: string; companyName?: string }) => void;
  isSubmitting: boolean;
}

export function QuizForm({ quizType, onSubmit, isSubmitting }: QuizFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const schema = quizType === "pyme" ? pymeSchema : baseSchema;
      schema.parse(formData);
      onSubmit(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
          ¡Ya casi tienes tu diagnóstico!
        </h2>
        <p className="text-muted-foreground">
          Ingresa tus datos para recibir tu análisis personalizado con recomendaciones específicas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            Nombre completo *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Tu nombre"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground">
            Correo electrónico *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-foreground">
            WhatsApp (opcional)
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+52 55 1234 5678"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {quizType === "pyme" && (
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-foreground">
              Nombre de la empresa *
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="companyName"
                type="text"
                placeholder="Tu empresa"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className={`pl-10 ${errors.companyName ? "border-destructive" : ""}`}
              />
            </div>
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-coral hover:opacity-90 text-white font-semibold py-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            "Ver mi diagnóstico"
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Tu información está segura. No compartimos tus datos con terceros.
        </p>
      </form>
    </motion.div>
  );
}
