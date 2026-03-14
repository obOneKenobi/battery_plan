"use client";

interface ToastProps {
    message: string;
    show: boolean;
}

export default function Toast({ message, show }: ToastProps) {
    return (
        <div
            className={`fixed top-16 left-1/2 -translate-x-1/2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 ${
                show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
            }`}
        >
            {message}
        </div>
    );
}
