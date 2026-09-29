"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { QRCodeSVG } from "qrcode.react";

// ==========================================
// TanStack Query Client Initialization
// ==========================================
const queryClient = new QueryClient();

// ==========================================
// Types & Schemas
// ==========================================
const tenantCreationSchema = z.object({
  tenant_name: z.string().min(2, "Institution name must be at least 2 characters"),
  domain: z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Must be a valid domain (e.g., klmce.edu)"),
  admin_first_name: z.string().min(1, "First name is required"),
  admin_last_name: z.string().min(1, "Last name is required"),
  admin_email: z.string().email("Invalid email address"),
  admin_password: z.string().min(12, "Password must be at least 12 characters long"),
});

type TenantCreationForm = z.infer<typeof tenantCreationSchema>;

interface TenantRecord {
  tenant_id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface TenantSetupResponse {
  tenant_id: string;
  admin_id: string;
  totp_uri: string;
}

// ==========================================
// Dashboard Component
// ==========================================
function SuperAdminDashboard() {
  const [provisioningResult, setProvisioningResult] = useState<TenantSetupResponse | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const form = useForm<TenantCreationForm>({
    resolver: zodResolver(tenantCreationSchema),
  });

  // 1. Ledger Query (Fetch all tenants)
  const { data: tenants, isLoading, refetch } = useQuery({
    queryKey: ['tenants-ledger'],
    queryFn: () => fetchClient<TenantRecord[]>("/tenants"),
  });

  // 2. Provisioning Mutation
  const mutation = useMutation({
    mutationFn: (data: TenantCreationForm) => 
      fetchClient<TenantSetupResponse>("/auth/setup-tenant", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      setProvisioningResult(data);
      form.reset();
      refetch();
    },
    onError: (error: any) => {
      setGlobalError(error.detail || "Failed to provision new institution tenant.");
    }
  });

  const onSubmit = (data: TenantCreationForm) => {
    setGlobalError(null);
    setProvisioningResult(null);
    mutation.mutate(data);
  };

  const handleCopySecret = (uri: string) => {
    // Extract the raw secret from the URI: otpauth://totp/Issuer:user?secret=JBSWY3DPEHPK3PXP&issuer=Issuer
    const match = uri.match(/secret=([^&]+)/);
    if (match && match[1]) {
      navigator.clipboard.writeText(match[1]);
      alert("Raw TOTP secret copied to clipboard.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
             <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
             Super Admin Control Plane
          </h1>
          <p className="text-gray-400 mt-1">Multi-tenant infrastructure provisioning and monitoring.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Tenant Creation Engine */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <h2 className="text-xl font-bold text-white mb-6">Provision Institution</h2>
              
              {globalError && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/50 flex items-start animate-in fade-in">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-300 font-medium">{globalError}</p>
                </div>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4 border-b border-gray-800 pb-6 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tenant Details</label>
                    <input
                      {...form.register("tenant_name")}
                      placeholder="Institution Name (e.g. KLMCE)"
                      className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600 text-sm"
                    />
                    {form.formState.errors.tenant_name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.tenant_name.message}</p>}
                  </div>
                  <div>
                    <input
                      {...form.register("domain")}
                      placeholder="Primary Domain (klmce.edu)"
                      className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600 text-sm"
                    />
                    {form.formState.errors.domain && <p className="text-red-400 text-xs mt-1">{form.formState.errors.domain.message}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Institution Admin Credentials</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        {...form.register("admin_first_name")}
                        placeholder="First Name"
                        className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600 text-sm"
                      />
                      {form.formState.errors.admin_first_name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.admin_first_name.message}</p>}
                    </div>
                    <div>
                      <input
                        {...form.register("admin_last_name")}
                        placeholder="Last Name"
                        className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600 text-sm"
                      />
                      {form.formState.errors.admin_last_name && <p className="text-red-400 text-xs mt-1">{form.formState.errors.admin_last_name.message}</p>}
                    </div>
                  </div>
                  <div>
                    <input
                      {...form.register("admin_email")}
                      type="email"
                      placeholder="Admin Email"
                      className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600 text-sm"
                    />
                    {form.formState.errors.admin_email && <p className="text-red-400 text-xs mt-1">{form.formState.errors.admin_email.message}</p>}
                  </div>
                  <div>
                    <input
                      {...form.register("admin_password")}
                      type="password"
                      placeholder="Root Password (Min 12 chars)"
                      className="w-full px-4 py-3 bg-gray-950/50 border border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600 text-sm"
                    />
                    {form.formState.errors.admin_password && <p className="text-red-400 text-xs mt-1">{form.formState.errors.admin_password.message}</p>}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-900/20 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? "Executing Provisioning..." : "Provision Tenant Infrastructure"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Ledger & MFA Output */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* MFA Output Modal */}
            {provisioningResult && (
              <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-3xl p-8 shadow-xl animate-in slide-in-from-top-4 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-48 h-48 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                 </div>
                 
                 <div className="bg-white p-4 rounded-2xl shadow-2xl relative z-10 shrink-0">
                    <QRCodeSVG
                      value={provisioningResult.totp_uri}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                 </div>
                 
                 <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2">Tenant Successfully Provisioned</h3>
                    <p className="text-emerald-400 mb-6 font-medium">Please instruct the new Institution Admin to immediately scan this barcode utilizing Google Authenticator or Authy to bind their hardware MFA token.</p>
                    <div className="flex gap-4">
                       <button onClick={() => handleCopySecret(provisioningResult.totp_uri)} className="px-5 py-2.5 bg-gray-900 border border-gray-700 hover:border-gray-600 text-gray-300 font-semibold text-sm rounded-lg transition-all shadow-md active:scale-95">
                          Copy Raw Secret
                       </button>
                       <button onClick={() => setProvisioningResult(null)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-lg transition-all shadow-md active:scale-95">
                          Acknowledge & Close
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {/* Tenant Ledger */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-bold text-white">Active Tenants Ledger</h3>
                    <p className="text-sm text-gray-400 mt-1">Cryptographically isolated database partitions.</p>
                 </div>
                 <button onClick={() => refetch()} className="p-2 text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-full shadow-inner">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                 </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-950/50 text-gray-400 border-b border-gray-800 uppercase tracking-wider font-semibold text-xs">
                    <tr>
                      <th className="px-6 py-4">Institution Name</th>
                      <th className="px-6 py-4">Tenant Domain</th>
                      <th className="px-6 py-4">Partition ID</th>
                      <th className="px-6 py-4 text-right">Provisioned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex justify-center">
                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : tenants && tenants.length > 0 ? (
                      tenants.map((tenant) => (
                        <tr key={tenant.tenant_id} className="hover:bg-gray-800/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                              {tenant.name[0]}
                            </div>
                            {tenant.name}
                          </td>
                          <td className="px-6 py-4 text-indigo-400 font-medium">@{tenant.domain}</td>
                          <td className="px-6 py-4 text-gray-500 font-mono text-xs">{tenant.tenant_id.split('-')[0]}***</td>
                          <td className="px-6 py-4 text-gray-400 text-right">{new Date(tenant.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          No tenants provisioned.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Expose Component wrapped with QueryClient
// ==========================================
export default function SuperAdminPortalPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuperAdminDashboard />
    </QueryClientProvider>
  );
}
