import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui-polished";
import {
  BarChart3, Users, AlertTriangle, TrendingUp, CheckCircle2,
  ArrowLeft, Lightbulb
} from "lucide-react";
import { Link } from "wouter";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend
} from "recharts";

const GROUP_COLORS: Record<string, string> = {
  pupil: "#0d9488",
  staff: "#6366f1",
  parent: "#f59e0b",
};

const GROUP_LABELS: Record<string, string> = {
  pupil: "Pupils",
  staff: "Staff",
  parent: "Parents",
};

function fetchWithAuth(url: string) {
  const token = localStorage.getItem("safeschool_token");
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export default function DiagnosticsResults() {
  const { user } = useAuth();
  const [, params] = useRoute("/diagnostics/:id/results");
  const surveyId = params?.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/diagnostics", surveyId, "results"],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/diagnostics/${surveyId}/results`);
      if (!res.ok) throw new Error("Failed to load results");
      return res.json();
    },
    enabled: !!surveyId,
  });

  if (!user || !["coordinator", "head_teacher", "senco"].includes(user.role)) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <AlertTriangle size={48} className="mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-muted-foreground mt-2">Only coordinators and head teachers can view diagnostic results.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 bg-muted rounded-lg w-80" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-2xl" />)}
        </div>
        <div className="h-80 bg-muted rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <AlertTriangle size={48} className="mx-auto text-destructive mb-4" />
        <h2 className="text-xl font-bold">Unable to load results</h2>
      </div>
    );
  }

  const { survey, participation, categories, insights, totalResponses } = data;

  const radarData = categories
    .filter((c: any) => c.category !== "System Readiness")
    .map((c: any) => ({
      category: c.category.replace(" & ", "\n& "),
      shortName: c.category.split(" ")[0],
      ...c.averages,
    }));

  const barData = categories.map((c: any) => ({
    category: c.category.length > 18 ? c.category.substring(0, 16) + "..." : c.category,
    fullCategory: c.category,
    ...c.averages,
  }));

  const totalParticipants =
    participation.pupil.responded + participation.staff.responded + participation.parent.responded;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/diagnostics" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2">
            <ArrowLeft size={14} /> Back to Diagnostics
          </Link>
          <h1 className="text-3xl font-display font-bold">{survey.title}</h1>
          <p className="text-muted-foreground mt-1">
            {survey.status === "active" ? "Live results — responses are still coming in" : `Closed ${survey.closedAt ? new Date(survey.closedAt).toLocaleDateString() : ""}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["pupil", "staff", "parent"] as const).map(group => {
          const p = participation[group];
          const pct = p.total > 0 ? Math.round((p.responded / p.total) * 100) : 0;
          return (
            <Card key={group}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${GROUP_COLORS[group]}20` }}>
                    <Users size={20} style={{ color: GROUP_COLORS[group] }} />
                  </div>
                  <div>
                    <p className="font-bold">{GROUP_LABELS[group]}</p>
                    <p className="text-xs text-muted-foreground">{p.responded} / {p.total} responded</p>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: GROUP_COLORS[group] }}
                  />
                </div>
                <p className="text-right text-xs font-bold mt-1" style={{ color: GROUP_COLORS[group] }}>{pct}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalParticipants === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Waiting for responses</h2>
            <p className="text-muted-foreground">
              No one has completed the diagnostic yet. Share the link with your school community.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {radarData.length > 0 && radarData.some((d: any) => d.pupil || d.staff || d.parent) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" />
                  Alignment Overview
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  How do pupils, staff, and parents compare across safeguarding areas? Larger shapes = higher scores (1-5 scale).
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80" role="img" aria-label="Radar chart comparing pupil, staff, and parent scores across safeguarding categories">
                  <ResponsiveContainer>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis
                        dataKey="shortName"
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      />
                      <PolarRadiusAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                      {participation.pupil.responded > 0 && (
                        <Radar name="Pupils" dataKey="pupil" stroke={GROUP_COLORS.pupil} fill={GROUP_COLORS.pupil} fillOpacity={0.15} strokeWidth={2} />
                      )}
                      {participation.staff.responded > 0 && (
                        <Radar name="Staff" dataKey="staff" stroke={GROUP_COLORS.staff} fill={GROUP_COLORS.staff} fillOpacity={0.15} strokeWidth={2} />
                      )}
                      {participation.parent.responded > 0 && (
                        <Radar name="Parents" dataKey="parent" stroke={GROUP_COLORS.parent} fill={GROUP_COLORS.parent} fillOpacity={0.15} strokeWidth={2} />
                      )}
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                Scores by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72" role="img" aria-label="Bar chart of average scores per category by group">
                <ResponsiveContainer>
                  <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" width={120} tick={{ fontSize: 10 }} />
                    {participation.pupil.responded > 0 && (
                      <Bar dataKey="pupil" name="Pupils" fill={GROUP_COLORS.pupil} radius={[0, 4, 4, 0]} />
                    )}
                    {participation.staff.responded > 0 && (
                      <Bar dataKey="staff" name="Staff" fill={GROUP_COLORS.staff} radius={[0, 4, 4, 0]} />
                    )}
                    {participation.parent.responded > 0 && (
                      <Bar dataKey="parent" name="Parents" fill={GROUP_COLORS.parent} radius={[0, 4, 4, 0]} />
                    )}
                    <Legend />
                    <Tooltip />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {insights && insights.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb size={20} className="text-amber-500" />
                  Key Insights
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Auto-generated observations based on the data. Use these as starting points for discussion.
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.map((insight: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                      <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="text-center text-sm text-muted-foreground py-4">
            Total responses recorded: {totalResponses}
          </div>
        </>
      )}
    </div>
  );
}
