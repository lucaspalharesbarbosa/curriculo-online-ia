from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl


class Hero(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    title: str
    location: str
    summary: str
    photo_url: str | None = Field(default=None, alias="photoUrl")


class Experience(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    company: str
    role: str
    start_date: str = Field(alias="startDate")
    end_date: str | None = Field(alias="endDate")
    location: str
    modality: str
    highlights: list[str]
    technologies: list[str]
    logo_url: str | None = Field(default=None, alias="logoUrl")


class Education(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    institution: str
    degree: str
    start_date: str = Field(alias="startDate")
    end_date: str = Field(alias="endDate")
    logo_url: str | None = Field(default=None, alias="logoUrl")
    website_url: str | None = Field(default=None, alias="websiteUrl")


class SkillItem(BaseModel):
    name: str
    level: int


class SkillGroup(BaseModel):
    category: str
    items: list[SkillItem]


class Certification(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str
    issuer: str
    issued_at: str = Field(alias="issuedAt")
    expires_at: str | None = Field(alias="expiresAt")
    logo_url: str | None = Field(default=None, alias="logoUrl")
    credential_url: str | None = Field(default=None, alias="credentialUrl")


class Recognition(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    issuer: str
    year: str
    description: str | None = None


class Project(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    description: str
    technologies: list[str]
    repository_url: str = Field(alias="repositoryUrl")


class Article(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str
    description: str
    url: str
    source: str
    published_at: str | None = Field(default=None, alias="publishedAt")


class Contact(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    linkedin: HttpUrl
    email: EmailStr | None = None
    github: HttpUrl | None = None
    resume_pdf_url: str | None = Field(default=None, alias="resumePdfUrl")


class Resume(BaseModel):
    hero: Hero
    about: str
    experiences: list[Experience]
    education: list[Education]
    skills: list[SkillGroup]
    certifications: list[Certification]
    recognitions: list[Recognition]
    projects: list[Project]
    articles: list[Article]
    contact: Contact
