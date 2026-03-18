import { useRoute, Link } from "wouter";
import { useGetProtocol } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui-polished";
import { formatDateTime, formatDate } from "@/lib/utils";
import { ArrowLeft, Shield, FileText, AlertTriangle, Users, Calendar, CheckCircle } from "lucide-react";

export default function ProtocolDetail() {
  const [, params] = useRoute("/protocols/:id");
  const id = params?.id || "";

  const { data: detail, isLoading } = useGetProtocol(id);

  if (isLoading) return <div className="animate-pulse h-96 bg-muted rounded-2xl m-8"></div>;

  if (!detail) return (
    <div className="p-8 text-center">
      <p className="text-destructive text-lg font-bold">Protocol not found</p>
      <Link href="/protocols">
        <Button variant="outline" className="mt-4">Back to Protocols</Button>
      </Link>
    </div>
  );

  const prot = detail.protocol || detail;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/protocols">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold">Protocol {prot.referenceNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              prot.status === "open" ? "bg-primary text-white" :
              prot.status === "closed" ? "bg-muted text-muted-foreground" :
              "bg-warning text-warning-foreground"
            }`}>
              {prot.status?.replace("_", " ")}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Opened on {formatDateTime(prot.openedAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="border-b border-border/50 bg-muted/10">
            <CardTitle className="text-lg">Protocol Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-background border border-border p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Type</p>
                <p className="font-semibold capitalize">{prot.protocolType?.replace(/_/g, " ")}</p>
              </div>
              <div className="bg-background border border-border p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Source</p>
                <p className="font-semibold capitalize">{prot.protocolSource?.replace(/_/g, " ") || "Not specified"}</p>
              </div>
              <div className="bg-background border border-border p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Victim</p>
                <p className="font-semibold">{prot.victimName || "Unknown"}</p>
              </div>
              <div className="bg-background border border-border p-4 rounded-xl">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Parent Notified</p>
                <p className="font-semibold">{prot.parentNotificationSent ? "Yes" : "Not yet"}</p>
              </div>
            </div>

            {prot.genderBasedViolence && (
              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <p className="font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Gender-based violence protocol active
                </p>
              </div>
            )}

            {prot.context && (
              <div>
                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Context</h4>
                <p className="bg-muted/30 p-4 rounded-xl text-foreground leading-relaxed whitespace-pre-wrap">
                  {prot.context}
                </p>
              </div>
            )}

            {prot.riskAssessment && (
              <div>
                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Risk Assessment</h4>
                <p className="bg-muted/30 p-4 rounded-xl text-foreground leading-relaxed whitespace-pre-wrap">
                  {prot.riskAssessment}
                </p>
              </div>
            )}

            {prot.protectiveMeasures && prot.protectiveMeasures.length > 0 && (
              <div>
                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Protective Measures</h4>
                <ul className="space-y-2">
                  {prot.protectiveMeasures.map((m: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={14} className="text-primary shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {prot.resolutionNotes && (
              <div>
                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-2">Resolution Notes</h4>
                <p className="bg-muted/30 p-4 rounded-xl text-foreground leading-relaxed whitespace-pre-wrap">
                  {prot.resolutionNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border/50 bg-muted/10">
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {prot.externalReferralRequired && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400">External referral required</p>
                  {prot.externalReferralBody && (
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">{prot.externalReferralBody}</p>
                  )}
                </div>
              )}
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interviews required</span>
                  <span className="font-bold">{prot.interviewsRequired ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Parent notified</span>
                  <span className="font-bold">{prot.parentNotificationSent ? "Yes" : "Not yet"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {detail.linkedIncidents && detail.linkedIncidents.length > 0 && (
            <Card>
              <CardHeader className="border-b border-border/50 bg-muted/10">
                <CardTitle className="text-lg">Linked Incidents</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                {detail.linkedIncidents.map((inc: any) => (
                  <Link key={inc.id} href={`/incidents/${inc.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer border border-border/50">
                      <FileText size={16} className="text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-bold">{inc.referenceNumber}</p>
                        <p className="text-xs text-muted-foreground capitalize">{inc.category}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
