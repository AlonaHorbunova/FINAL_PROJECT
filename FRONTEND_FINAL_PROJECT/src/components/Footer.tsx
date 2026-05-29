import React from "react";
import { Box, Link, Typography } from "@mui/material";

const Footer: React.FC = () => {
  const items = [
    "Home",
    "Search",
    "Explore",
    "Messages",
    "Notifications",
    "Create",
    "Profile",
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: 4, // Немного упростили отступы
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        borderTop: "1px solid #dbdbdb",
        bgcolor: "#ffffff",
        mt: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {items.map((item) => (
          <Link
            key={item}
            href="#"
            sx={{
              fontSize: "12px",
              color: "#737373",
              textDecoration: "none",
              fontWeight: "500",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {item}
          </Link>
        ))}
      </Box>
      <Typography variant="body2" sx={{ fontSize: "12px", color: "#737373" }}>
        © {new Date().getFullYear()} ICHGRAM FROM ICH PRO
      </Typography>
    </Box>
  );
};

export default Footer;
