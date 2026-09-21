import { useEffect, useRef, useState } from 'react';
import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { MdFingerprint, MdDeleteOutline } from "react-icons/md";

import { toastAlert } from '../../../Alert';
import SvgLoader from '../../../SvgLoader';

import api from '../../../../services/api';

type PasskeyItem = {
    cred_id: string;
    label?: string | null;
    createdAt?: string | null;
    lastUsedAt?: string | null;
};

export default function Passkeys() {
    const operationInFlight = useRef(false);
    const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [removing, setRemoving] = useState<string | null>(null);
    const [label, setLabel] = useState("");

    const supported =
        typeof window !== "undefined" &&
        window.isSecureContext &&
        typeof window.PublicKeyCredential !== "undefined" &&
        browserSupportsWebAuthn();

    const fetchPasskeys = async () => {
        setListLoading(true);
        try {
            const { data } = await api.get("/passkeys");
            setPasskeys(Array.isArray(data) ? data : []);
        } catch (err: any) {
            toastAlert({ icon: "error", title: err?.message || "Could not load passkeys", timer: 2500 });
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        fetchPasskeys();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (iso?: string | null) => {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString();
        } catch {
            return "—";
        }
    };

    const handleRegister = async () => {
        if (operationInFlight.current || !supported) return;
        operationInFlight.current = true;
        setRegistering(true);

        try {
            const { data: { options, stateToken } } = await api.post("/passkeys/register/start", {});
            const credential = await startRegistration({ optionsJSON: options });
            await api.post("/passkeys/register/finish", {
                credential,
                stateToken,
                label: label.trim() || undefined,
            });

            toastAlert({ icon: 'success', title: 'Passkey registered! You can now sign in with it.', timer: 3000 });
            setLabel("");
            await fetchPasskeys();
        } catch (err: any) {
            const msg = `${err?.name || ""} ${err?.code || ""} ${err?.message || ""}`;
            // Dismissing the browser ceremony is not an error worth a toast.
            if (!/abort|cancel|notallowed|not_allowed/i.test(msg)) {
                toastAlert({ icon: "error", title: err?.message || "Passkey registration failed", timer: 3000 });
            }
        } finally {
            operationInFlight.current = false;
            setRegistering(false);
        }
    };

    const handleRemove = async (cred_id: string) => {
        if (operationInFlight.current) return;
        operationInFlight.current = true;
        setRemoving(cred_id);

        try {
            await api.delete(`/passkeys/${encodeURIComponent(cred_id)}`);
            toastAlert({ icon: 'success', title: 'Passkey removed', timer: 2500 });
            await fetchPasskeys();
        } catch (err: any) {
            toastAlert({ icon: "error", title: err?.message || "Could not remove passkey", timer: 2500 });
        } finally {
            operationInFlight.current = false;
            setRemoving(null);
        }
    };

    return (
        <div className="px-6">
            <p className="text-xl tracking-tight mb-3 text-gray-900 dark:text-gray-300">Passkeys</p>
            <p className="text-base tracking-tight mb-6 text-gray-600">
                Sign in with your fingerprint, face or security key instead of typing a password.
                Your existing password or Google sign-in keeps working.
            </p>
            {!supported && <p role="status" className="mb-4 text-sm text-gray-600">
                Creating passkeys requires a supported browser and a secure connection. You can still manage your saved passkeys here.
            </p>}
            <p className="text-xs uppercase tracking-widest mb-2 text-gray-900 dark:text-gray-300">Label for this device (optional)</p>
            <input
                type="text"
                value={label}
                maxLength={64}
                disabled={!supported || registering || removing !== null}
                onChange={({ currentTarget }) => setLabel(currentTarget.value)}
                placeholder="e.g. MacBook, Pixel 8"
                className="sign-text-inputs bg-[#eeeff1] dark:bg-stone-900 text-gray-900 dark:text-gray-300 border border-gray-500 dark:border-gray-600 active:border focus:border-gray-400"
            />
            <button
                type="button"
                onClick={() => handleRegister()}
                disabled={!supported || registering || removing !== null}
                className="mt-4 w-full py-3 font-normal text-white hover:bg-green-700 bg-green-600 transition-all duration-500 ease-in-out rounded-3xl text-sm uppercase tracking-wide hover:tracking-widest disabled:cursor-not-allowed disabled:opacity-70"
            >
                {registering ? (
                    <SvgLoader options={{ showLoadingText: true }} />
                ) : (
                    <div className="flex items-center justify-center">
                        <MdFingerprint size={24} className="mr-2" />
                        <span>Register this device</span>
                    </div>
                )}
            </button>
            <div className="mt-7">
                <p className="text-sm uppercase tracking-widest mb-3 text-gray-900 dark:text-gray-300">
                    Registered passkeys
                </p>
                {listLoading ? (
                    <div className="flex justify-center py-6">
                        <SvgLoader options={{ showLoadingText: true }} />
                    </div>
                ) : passkeys.length === 0 ? (
                    <p className="text-sm text-gray-600 tracking-wide">No passkeys yet — register this device to get started.</p>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {passkeys.map((pk) => (
                            <div
                                key={pk.cred_id}
                                className="flex flex-row items-center justify-between rounded-2xl px-4 py-3 border border-gray-400 dark:border-gray-600 bg-[#eeeff1] dark:bg-stone-900"
                            >
                                <div className="flex flex-col">
                                    <p className="text-[15px] text-gray-900 dark:text-gray-200">
                                        {pk.label || "Passkey"}
                                    </p>
                                    <p className="text-[11px] uppercase tracking-wider text-gray-500">
                                        added {formatDate(pk.createdAt)}
                                        {pk.lastUsedAt ? ` · used ${formatDate(pk.lastUsedAt)}` : ""}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={registering || removing !== null}
                                    onClick={() => handleRemove(pk.cred_id)}
                                    title="Remove passkey"
                                    aria-label={`Remove passkey ${pk.label || ""}`}
                                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-red-600 hover:bg-red-600/10 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {removing === pk.cred_id ? (
                                        <SvgLoader options={{ showLoadingText: false, LoaderClassName: "!h-5 !w-5" }} />
                                    ) : (
                                        <MdDeleteOutline size={22} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
