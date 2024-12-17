import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { navigate } from "raviger";
import { useTranslation } from "react-i18next";

import CareIcon from "@/CAREUI/icons/CareIcon";

import { Button } from "@/components/ui/button";

import Loading from "@/components/Common/Loading";
import { UserModel } from "@/components/Users/models";

import * as Notification from "@/Utils/Notifications";
import routes from "@/Utils/request/api";
import query from "@/Utils/request/query";
import { formatName } from "@/Utils/utils";

export function AppointmentSuccess(props: { appointmentId: string }) {
  const { appointmentId } = props;
  const { t } = useTranslation();
  const OTPaccessToken = localStorage.getItem("OTPaccessToken");
  const doctorData: UserModel = JSON.parse(
    localStorage.getItem("doctor") ?? "{}",
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["appointment"],
    queryFn: query(routes.otp.getAppointments, {
      headers: {
        Authorization: `Bearer ${OTPaccessToken}`,
      },
    }),
    enabled: !!OTPaccessToken,
  });

  if (error) {
    Notification.Error({ msg: t("appointment_not_found") });
  }

  const appointmentData = data?.results.find(
    (appointment) => appointment.id === appointmentId,
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="max-w-2xl mx-auto p-8 mt-4">
      <div className="flex flex-row justify-start mb-4">
        <Button
          variant="outline"
          className="border border-secondary-400"
          onClick={() => {
            navigate("/facilities");
          }}
        >
          <CareIcon icon="l-square-shape" className="h-4 w-4 mr-1" />
          <span className="text-sm underline">{t("back_to_home")}</span>
        </Button>
      </div>
      <div className="bg-secondary-100/50 rounded-lg shadow-sm p-12 border border-secondary-400 text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <CareIcon icon="l-check" className="w-8 h-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          {t("appointment_booking_success")}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">
            {t("doctor_nurse")}:
          </h2>
          <p className="text-lg font-medium">{formatName(doctorData)}</p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">
            {t("patient")}:
          </h2>
          <p className="text-lg font-medium">{appointmentData?.patient.name}</p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">
            {t("date")}:
          </h2>
          <p className="text-lg font-medium">
            {format(
              new Date(appointmentData?.token_slot.start_datetime ?? ""),
              "do MMMM",
            )}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-1">
            {t("time")}:
          </h2>
          <p className="text-lg font-medium">
            {format(
              new Date(appointmentData?.token_slot.start_datetime ?? ""),
              "hh:mm a",
            )}
          </p>
        </div>
      </div>

      <div className="mt-12 text-left space-y-2">
        <p className="text-gray-900">
          {formatName(doctorData)} {t("doc_will_visit_patient")}
        </p>
        <p className="text-gray-600">{t("thank_you_for_choosing")}</p>
      </div>
    </div>
  );
}
