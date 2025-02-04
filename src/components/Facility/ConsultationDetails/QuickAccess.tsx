import { useQuery } from "@tanstack/react-query";
import { Link } from "raviger";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import LinkDepartmentsSheet from "@/components/Patient/LinkDepartmentsSheet";

import query from "@/Utils/request/query";
import { Encounter } from "@/types/emr/encounter";
import questionnaireApi from "@/types/questionnaire/questionnaireApi";

interface QuickAccessProps {
  encounter: Encounter;
}

export default function QuickAccess({ encounter }: QuickAccessProps) {
  const { t } = useTranslation();

  const { data: response } = useQuery({
    queryKey: ["questionnaires"],
    queryFn: query(questionnaireApi.list),
  });

  const questionnaireList = response?.results || [];

  const encounterSettings = [
    { id: "encounter_settings", label: t("encounter_settings") },
    { id: "treatment_summary", label: t("treatment_summary") },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Questionnaire Section */}
      <section className="space-y-2 p-2">
        <h3 className="text-lg font-semibold mb-3">{t("questionnaire")}</h3>
        <div className="space-y-3 p-2 font-semibold">
          {questionnaireList.map((item) => (
            <Link
              className="flex items-center gap-2 text-sm hover:text-gray-500 text-gray-900"
              key={item.id}
              // className="w-full justify-start gap-2 h-auto py-2"
              href={`/facility/${encounter.facility.id}/patient/${encounter.patient.id}/encounter/${encounter.id}/questionnaire/${item.slug}`}
            >
              <CareIcon icon="l-file-alt" className="h-4 w-4 text-gray-950" />
              {item.title}
            </Link>
          ))}
        </div>
      </section>

      {/* Update Encounter Details */}
      <section className="text-gray-950">
        <h3 className="text-lg font-medium mb-3">
          {t("update_encounter_details")}
        </h3>
        <div className="space-y-2">
          {encounterSettings.map((item) => (
            <div key={item.id} className="flex items-center space-x-2 px-4">
              <label
                htmlFor={item.id}
                className="text-sm text-gray-950 underline font-semibold"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </section>

      {/* Departments and Teams */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-950">
            {t("departments_and_teams")}
          </h3>
          <LinkDepartmentsSheet
            entityType="encounter"
            entityId={encounter.id}
            currentOrganizations={encounter.organizations}
            facilityId={encounter.facility.id}
            trigger={
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  // onClick={onDepartmentUpdate}
                  className="text-sm font-semibold border-gray-400 text-gray-950"
                >
                  {t("update_department")}
                  <CareIcon icon="l-plus" className="ml-1 h-3 w-3" />
                </Button>
              </div>
            }
          />
        </div>
        <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-md">
          <LinkDepartmentsSheet
            entityType="encounter"
            entityId={encounter.id}
            currentOrganizations={encounter.organizations}
            facilityId={encounter.facility.id}
            trigger={
              <div className="flex flex-wrap gap-2 ">
                {encounter.organizations.map((org) => (
                  <Badge
                    key={org.id}
                    className="bg-indigo-100 text-indigo-800 font-medium cursor-pointer text-sm "
                    variant="outline"
                    title={`Organization: ${org.name}${org.description ? ` - ${org.description}` : ""}`}
                  >
                    {org.name}
                  </Badge>
                ))}
              </div>
            }
          />
        </div>
      </section>

      {/* Tags */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium">{t("tags")}</h3>
          <Button
            variant="outline"
            size="sm"
            // onClick={onTagUpdate}
            className="text-sm  font-semibold border-gray-400 text-gray-950"
          >
            {t("add_tags")}
            <CareIcon icon="l-plus" className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-md ">
          <Badge variant="destructive" className="text-sm">
            {t("medico_legal_case")}
          </Badge>
          <Badge variant="destructive" className="text-sm">
            {t("medico_legal_case")}
          </Badge>
        </div>
      </section>

      {/* Hospitalisation Details */}
      {encounter.hospitalization && (
        <section>
          <h3 className="text-lg font-medium mb-3">
            {t("hospitalisation_details")}
          </h3>
          <div className="space-y-2 text-sm mt-4 bg-gray-50 p-2 rounded-md">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("admit_source")}</span>
              <span className="font-semibold text-gray-950">
                {t(
                  `encounter_admit_sources__${encounter.hospitalization?.admit_source}`,
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {t("diet_preference")}
              </span>
              <span className="font-semibold text-gray-950">
                {t(
                  `encounter_diet_preference__${encounter.hospitalization?.diet_preference}`,
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("re_admission")}</span>
              <span className="font-semibold text-gray-950">
                {t(`${encounter.hospitalization?.re_admission}`)}
              </span>
            </div>
            <Button
              asChild
              variant="outline"
              className="font-semibold rounded-md border-gray-400 text-gray-950"
            >
              <Link
                href={`/facility/${encounter.facility.id}/patient/${encounter.patient.id}/encounter/${encounter.id}/questionnaire/encounter`}
              >
                {t("update_hospitalisation_details")}
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
