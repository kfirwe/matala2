import initApp from "./server";

const PORT = process.env.PORT || 3000;

initApp()
  .then((app) => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error initializing app:", err);
  });
