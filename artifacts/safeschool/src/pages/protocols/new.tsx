import { useState, useEffect } from "react";
import { useRoute, useSearch, useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCreateProtocol, useGetIncident } from "@workspace/api-client-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from "@/components/ui-polished";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

const PROTOCOL_TYPES = [
  { value: "convivexit", label: "Convivèxit (Bullying)" },
  { value: "lopivi", label: "LOPIVI (Safeguarding)" },
  { value: "machista_violence", label: "Machista Violence" },
  { value: "general_safeguarding", label: "General Safeguarding" },
];

const PROTOCOL_SOURCES = [
  { value: "pupil_report", label: "Pupil report" },
  { value: "teacher_observation", label: "Teacher observation" },
  { value: "parent_concern", label: "Parent concern" },
  { value: "pattern_alert", label: "Pattern alert" },
  { value: "external_referral", label: "External referral" },
];

const RISK_LEVELS = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700 border-green-300", desc: "No immediate concern, monitoring recommended" },
  { value: "medium", label: "Medium", color: "bg-amber-100 text-amber-700 border-amber-300", desc: "Some concern, intervention and review needed" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700 border-orange-300", desc: "Significant concern, urgent action required" },
  { value: "critical", label: "Critical", color: "bg-red-100 text-red-700 border-red-300", desc: "Immediate danger, emergency response needed" },
];

const RISK_FACTORS = [
  "Repeat behaviour",
  "Power imbalance",
  "Age gap between children",
  "Vulnerability (SEN/disability)",
  "Self-harm risk",
  "Family concerns",
  "Online element",
  "Group involvement",
];

const PROTECTIVE_FACTORS = [
  "Supportive family",
  "Good peer relationships",
  "Child is willing to talk",
  "Already receiving external support",
];

export default function NewProtocol() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const incidentId = urlParams.get("incidentId") || "";
  const queryClient = useQueryClient();

  const { data: incident } = useGetIncident(incidentId || "none", {
    query: { enabled: !!incidentId },
  });

  const { data: pupilData } = useQuery<any>({
    queryKey: ["/api/my-pupils"],
    queryFn: async () => {
      const token = localStorage.getItem("safeschool_token");
      const res = await fetch("/api/my-pupils", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !incidentId,
  });

  const allPupils: any[] = pupilData
    ? Object.values(pupilData.classes as Record<string, any[]>).flat()
    : [];

  const createProtocol = useCreateProtocol();

  const [protocolType, setProtocolType] = useState("");
  const [protocolSource, setProtocolSource] = useState("");
  const [genderBasedViolence, setGenderBasedViolence] = useState(false);
  const [context, setContext] = useState("");
  const [victimId, setVictimId] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [protectiveFactors, setProtectiveFactors] = useState<string[]>([]);
  const [riskNotes, setRiskNotes] = useState("");
  const [externalReferralRequired, setExternalReferralRequired] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (incident) {
      if (incident.victimIds?.length) {
        setVictimId(incident.victimIds[0]);
      }
      const cats = (incident.category || "").toLowerCase();
      if (cats.includes("sexual") || cats.includes("coercive")) {
        setProtocolType("machista_violence");
        setGenderBasedViolence(true);
      } else if (cats.includes("safeguarding") || cats.includes("neglect")) {
        setProtocolType("lopivi");
      } else {
        setProtocolType("convivexit");
      }
      setProtocolSource("pupil_report");
    }
  }, [incident]);

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!protocolType || !victimId) {
      setError("Please select a protocol type and victim.");
      return;
    }

    if (!riskLevel) {
      setError("Please select a risk level.");
      return;
    }

    try {
      const result = await createProtocol.mutateAsync({
        data: {
          protocolType,
          protocolSource: protocolSource || undefined,
          genderBasedViolence,
          context: context || undefined,
          linkedIncidentIds: incidentId ? [incidentId] : [],
          victimId,
          riskLevel,
          riskAssessment: riskNotes || undefined,
          riskFactors,
          protectiveFactors,
          externalReferralRequired,
        },
      });
      queryClient.invalidateQueries({ queryKey: ["/api/protocols"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      setLocation(`/protocols/${result.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.data?.error || err?.message || "Failed to create protocol. Please try again.";
      setError(msg);
    }
  };

  const victimName = incident?.victimNames?.[0] || "Unknown";
  const perpetratorNames = incident?.perpetratorNames?.join(", ") || "Unknown";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={incidentId ? `/incidents/${incidentId}` : "/protocols"}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold">Open Formal Protocol</h1>
          <p className="text-muted-foreground mt-1">Start a formal safeguarding or behaviour protocol.</p>
        </div>
      </div>

      {incident && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm font-bold flex items-center gap-2">
              <AlertTriangle size={16} className="text-primary" />
              Linked to incident {incident.referenceNumber}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {incident.category} incident — Victim: {victimName}, Involved: {perpetratorNames}
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 text-destructive text-sm font-bold">{error}</CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="border-b border-border/50">
            <CardTitle>Protocol Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label>Protocol Type</Label>
              <select
                value={protocolType}
                onChange={(e) => setProtocolType(e.target.value)}
                className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1"
                required
              >
                <option value="">Select protocol type...</option>
                {PROTOCOL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Source</Label>
              <select
                value={protocolSource}
                onChange={(e) => setProtocolSource(e.target.value)}
                className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1"
              >
                <option value="">Select source...</option>
                {PROTOCOL_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="gbv"
                checked={genderBasedViolence}
                onChange={(e) => setGenderBasedViolence(e.target.checked)}
                className="w-5 h-5 rounded border-input"
              />
              <Label htmlFor="gbv" className="cursor-pointer">Gender-based violence protocol</Label>
            </div>

            {!incidentId && (
              <div>
                <Label>Victim / Child of Concern</Label>
                <select
                  value={victimId}
                  onChange={(e) => setVictimId(e.target.value)}
                  className="w-full h-12 rounded-xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1"
                  required
                >
                  <option value="">Select child...</option>
                  {allPupils.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.className || p.yearGroup || ""})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label>Context / Notes</Label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Describe the context and reason for opening this protocol..."
                className="w-full min-h-[120px] rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1 resize-y"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader className="border-b border-border/50">
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <Label className="mb-3 block">Risk Level</Label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {RISK_LEVELS.map((rl) => (
                  <button
                    key={rl.value}
                    type="button"
                    onClick={() => setRiskLevel(rl.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      riskLevel === rl.value
                        ? `${rl.color} border-current ring-2 ring-current/20`
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-bold text-sm">{rl.label}</p>
                    <p className="text-xs mt-1 opacity-80">{rl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Risk Factors <span className="text-muted-foreground font-normal text-sm">(select all that apply)</span></Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {RISK_FACTORS.map((rf) => (
                  <label
                    key={rf}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      riskFactors.includes(rf)
                        ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={riskFactors.includes(rf)}
                      onChange={() => setRiskFactors(toggleArrayItem(riskFactors, rf))}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm font-medium">{rf}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Protective Factors <span className="text-muted-foreground font-normal text-sm">(select all that apply)</span></Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PROTECTIVE_FACTORS.map((pf) => (
                  <label
                    key={pf}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      protectiveFactors.includes(pf)
                        ? "border-green-300 bg-green-50 dark:bg-green-950/20"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={protectiveFactors.includes(pf)}
                      onChange={() => setProtectiveFactors(toggleArrayItem(protectiveFactors, pf))}
                      className="w-4 h-4 rounded border-input"
                    />
                    <span className="text-sm font-medium">{pf}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Additional Risk Notes (optional)</Label>
              <textarea
                value={riskNotes}
                onChange={(e) => setRiskNotes(e.target.value)}
                placeholder="Any additional observations about the risk..."
                className="w-full min-h-[80px] rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1 resize-y"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="externalRef"
                checked={externalReferralRequired}
                onChange={(e) => setExternalReferralRequired(e.target.checked)}
                className="w-5 h-5 rounded border-input"
              />
              <Label htmlFor="externalRef" className="cursor-pointer">External referral required</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-6">
          <Link href={incidentId ? `/incidents/${incidentId}` : "/protocols"}>
            <Button type="button" variant="outline" size="lg">Cancel</Button>
          </Link>
          <Button
            type="submit"
            size="lg"
            className="flex-1 bg-slate-900 text-white hover:bg-slate-800"
            disabled={createProtocol.isPending}
          >
            <Shield className="mr-2" size={18} />
            {createProtocol.isPending ? "Opening Protocol..." : "Open Protocol"}
          </Button>
        </div>
      </form>
    </div>
  );
}
