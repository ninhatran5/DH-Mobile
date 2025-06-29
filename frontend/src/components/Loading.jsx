const Loading = () => {
  return (
    <div
      className="preloader-wrapper"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(61, 61, 61, 0.5)", 
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div className="preloader"></div>
    </div>
  );
};

export default Loading;
