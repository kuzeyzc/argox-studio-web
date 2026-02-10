import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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

const loginSchema = z.object({
  email: z.string().min(1, "E-posta gerekli").email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await login(values.email, values.password);
    if (result.success) {
      toast({ title: "Giriş Başarılı" });
      navigate("/admin", { replace: true });
    } else {
      form.setError("root", { message: result.error });
    }
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
          <CardTitle className="text-xl font-heading">Admin Girişi</CardTitle>
          <CardDescription className="text-zinc-400">
            E-posta ve şifrenizle giriş yapın
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
                        placeholder="ornek@argox.studio"
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
                        autoComplete="current-password"
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
                {form.formState.isSubmitting ? "Giriş yapılıyor…" : "Giriş Yap"}
              </Button>
            </form>
          </Form>
          <p className="text-center text-xs text-zinc-500 mt-4 space-x-2">
            <Link to="/sanatci-sifre" className="text-primary hover:underline">Sanatçı şifre oluştur</Link>
            <span>·</span>
            <Link to="/" className="text-primary hover:underline">Siteye dön</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
