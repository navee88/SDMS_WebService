import React from "react";

const FullPageLoader = ({ loading, text = "" }) => {
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/20 flex items-center justify-center">
      <div className="rounded-sm flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A57A6]" />
        {text && (
          <p className="text-sm font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

export default FullPageLoader;
