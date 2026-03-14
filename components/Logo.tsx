export default function Logo({ size = 20 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="1" y="5" width="19" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
            <rect x="20" y="9" width="3" height="6" rx="1" fill="currentColor" />
            <path
                d="M13.5 7.5L8 13h4l-2.5 4L15 11.5h-4l2.5-4z"
                fill="currentColor"
            />
        </svg>
    );
}
