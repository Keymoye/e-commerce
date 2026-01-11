import { getRecentAudits } from "@/lib/audit";
import { assertAdmin } from "@/lib/auth/assertAdmin";

export default async function AdminAuditPage() {
  // server-side guard
  await assertAdmin();
  const audits = await getRecentAudits(50);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Admin Audit</h2>
      <div className="space-y-2">
        {audits.length === 0 ? (
          <p>No audit entries found.</p>
        ) : (
          <table className="w-full text-left table-auto border-collapse">
            <thead>
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2">Action</th>
                <th className="p-2">User</th>
                <th className="p-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a: any) => (
                <tr key={a.id} className="border-t">
                  <td className="p-2">
                    {new Date(a.created_at).toLocaleString()}
                  </td>
                  <td className="p-2">{a.action}</td>
                  <td className="p-2">{a.user_id ?? "system"}</td>
                  <td className="p-2">{JSON.stringify(a.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
