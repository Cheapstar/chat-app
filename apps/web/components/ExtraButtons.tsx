

export function ExtraButtons({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex bg-white rounded-md shadow-sm border border-gray-300 w-max px-2 py-1.5">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                className="grow px-4 py-2.5 hover:bg-gray-100 rounded-md transition-all duration-150"
                type="button"
            >
                Attach Image
            </button>
        </div>
    );
}
