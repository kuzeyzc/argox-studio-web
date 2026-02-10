import { useStudioData } from "@/hooks/useStudioData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ImagePlus, MessageSquare, Briefcase } from "lucide-react";
import { AdminAppointments } from "./AdminAppointments";
import { useAuth } from "@/hooks/useAuth";

export function AdminDashboard() {
  const { data, currentUser } = useStudioData();
  const { isManager } = useAuth();
  const isManagerRole = currentUser.role === "MANAGER";

  const cards = [
    {
      title: "Sanatçılar",
      value: data.artists.length,
      icon: Users,
      desc: isManagerRole ? "Tüm sanatçılar" : "Kendi profilin",
    },
    {
      title: "Galeri Çalışmaları",
      value: isManagerRole
        ? data.tattooWorks.length
        : data.tattooWorks.filter((w) => w.artistId === currentUser.artistId).length,
      icon: ImagePlus,
      desc: isManagerRole ? "Toplam iş" : "Senin işlerin",
    },
    ...(isManagerRole
      ? [
          { title: "Referanslar", value: data.testimonials.length, icon: MessageSquare, desc: "Müşteri yorumları" },
          { title: "Hizmetlerimiz", value: data.services.length, icon: Briefcase, desc: "Hizmet kartları" },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title} className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{c.title}</CardTitle>
              <c.icon className="h-4 w-4 text-zinc-500" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-zinc-100">{c.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{c.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tüm Randevular: yönetici tüm listeyi, sanatçı kendi + Tercihim Yok randevularını görür */}
      <AdminAppointments
        compact
        mode={isManager ? "all" : "artist"}
        artistId={currentUser.artistId}
      />
    </div>
  );
}
