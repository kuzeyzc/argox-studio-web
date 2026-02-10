import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { checkArtistEmailExists } from "@/lib/supabaseStudio";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const signupSchema = z
  .object({
    email: z.string().min(1, "E-posta gerekli").email("Geçerli bir e-posta girin"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
    confirmPassword: z.string().min(1, "Şifre tekrarı gerekli"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

/**
 * Sanatçı şifre oluşturma: Artists tablosunda kayıtlı e-posta ile Supabase Auth hesabı açar.
 * İlk giriş için kullanılır.
 */
const ArtistSignupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const email = values.email.trim().toLowerCase();
    const exists = await checkArtistEmailExists(email);
    if (!exists) {
      form.setError("root", { message: "Bu e-posta sanatçı listesinde bulunamadı. Yöneticinize başvurun." });
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password: values.password,
      options: { emailRedirectTo: window.location.origin + "/login" },
    });
    if (error) {
      if (error.message.includes("already registered")) {
        form.setError("root", { message: "Bu e-posta zaten kayıtlı. Giriş sayfasından giriş yapın." });
      } else {
        form.setError("root", { message: error.message });
      }
      return;
    }
    toast({ title: "Hesap oluşturuldu", description: "Giriş sayfasından giriş yapabilirsiniz." });
    navigate("/login", { replace: true });
  });

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,hsl(var(--background))_70%)]" />
      </div>

      <Card className="relative w-full max-w-md border-zinc-800 bg-zinc-900/90 shadow-xl shadow-black/20">
        <CardHeader className="space-y-1 text-center pb-2">
          <Link to="/" className="inline-block font-heading font-bold text-2xl tracking-tight text-zinc-100">
            ARGO<span className="text-primary">X</span>
          </Link>
          <CardTitle className="text-xl font-heading">Sanatçı Şifre Oluştur</CardTitle>
          <CardDescription className="text-zinc-400">
            Stüdyoda kayıtlı e-postanızla ilk kez giriş yapacaksanız buradan şifrenizi oluşturun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-4">
              {form.formState.errors.root && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {form.formState.errors.root.message}
                </p>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">E-posta</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="sanatci@argox.studio"
                        className="bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Şifre</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="En az 8 karakter"
                        className="bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300">Şifre tekrar</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Oluşturuluyor…" : "Şifre Oluştur"}
              </Button>
            </form>
          </Form>
          <p className="text-center text-xs text-zinc-500 mt-4 space-x-2">
            <Link to="/login" className="text-primary hover:underline">Giriş sayfasına dön</Link>
            <span>·</span>
            <Link to="/" className="text-primary hover:underline">Siteye dön</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArtistSignupPage;
