import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Certifications } from "./Certifications";

describe("Certifications", () => {
  it("renders certification details", () => {
    render(
      <Certifications
        items={[
          {
            name: "AWS Certified Cloud Practitioner",
            issuer: "Amazon Web Services (AWS)",
            issuedAt: "2024-07",
            expiresAt: "2027-07",
            logoUrl: "/aws-certified-cloud-pratctitioner-logo.png",
          },
        ]}
      />,
    );

    expect(
      screen.getByText("AWS Certified Cloud Practitioner"),
    ).toBeInTheDocument();
    expect(screen.getByText("Amazon Web Services (AWS)")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: /logo aws certified cloud practitioner/i,
      }),
    ).toBeInTheDocument();
  });
});
