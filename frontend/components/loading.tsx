import React from "react";

function Loading() {
  return (
    <div className="position-absolute fixed-top w-100 h-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-dark" role="status" />
    </div>
  );
}

export default Loading;