import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Certifications } from "./Certifications";

describe("Certifications", () => {
  afterEach(() => {
    cleanup();
  });

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
            credentialUrl: null,
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
        name: /logo amazon web services \(aws\)/i,
      }),
    ).toBeInTheDocument();
  });

  it("agrupa certificações do mesmo emissor sob um único logo e mostra só o ano", () => {
    render(
      <Certifications
        items={[
          {
            name: "SOLID com Java",
            issuer: "Alura",
            issuedAt: "2022-03",
            expiresAt: null,
            logoUrl: "/alura-logo.png",
            credentialUrl: null,
          },
          {
            name: "Formação Angular",
            issuer: "Alura",
            issuedAt: "2021-03",
            expiresAt: null,
            logoUrl: "/alura-logo.png",
            credentialUrl: null,
          },
        ]}
      />,
    );

    expect(screen.getAllByRole("img", { name: /logo alura/i })).toHaveLength(1);
    expect(screen.getAllByText("Alura")).toHaveLength(1);
    expect(screen.getByText("SOLID com Java")).toBeInTheDocument();
    expect(screen.getByText("Formação Angular")).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();
    expect(screen.queryByText("2022-03")).not.toBeInTheDocument();
  });

  it("mostra o link 'Ver certificado' quando credentialUrl está preenchido", () => {
    render(
      <Certifications
        items={[
          {
            name: "Formação React",
            issuer: "Alura",
            issuedAt: "2024-03",
            expiresAt: null,
            logoUrl: null,
            credentialUrl: "https://cursos.alura.com.br/certificate/abc123",
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: /ver certificado/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://cursos.alura.com.br/certificate/abc123",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("não mostra o link 'Ver certificado' quando credentialUrl é null", () => {
    render(
      <Certifications
        items={[
          {
            name: "Scrum Fundamentals Certified",
            issuer: "SCRUMstudy",
            issuedAt: "2023-11",
            expiresAt: null,
            logoUrl: null,
            credentialUrl: null,
          },
        ]}
      />,
    );

    expect(
      screen.queryByRole("link", { name: /ver certificado/i }),
    ).not.toBeInTheDocument();
  });
});
