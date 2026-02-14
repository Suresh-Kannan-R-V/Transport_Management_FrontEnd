import { Card, CardBody, cn } from "@heroui/react";
import { ArrowRight, LogOut, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Setting = () => {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      title: "Add Users",
      description: "Create new user accounts and set permissions.",
      icon: <Users className="text-indigo-600" size={24} />,
      path: "/settings/add-users",
      color: "bg-indigo-50",
    },
    {
      title: "Session Management",
      description: "View active sessions and force logout users if necessary.",
      icon: <LogOut className="text-rose-600" size={24} />,
      path: "/settings/logout-users",
      color: "bg-rose-50",
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">
          Transport Admin Settings
        </h1>
        <p className="text-slate-500 text-sm">
          Manage your team and security preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsOptions.map((option, index) => (
          <Card
            key={index}
            isPressable
            onPress={() => navigate(option.path)}
            className="rounded-xl border-2 border-gray-100 shadow-sm hover:shadow-md hover:bg-indigo-50/20 hover:border-indigo-500 transition-all group overflow-hidden"
          >
            <CardBody className="p-6 flex flex-row items-start gap-5">
              {/* Icon Container */}
              <div
                className={cn(
                  "p-4 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110",
                  option.color,
                )}
              >
                {option.icon}
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-1">
                <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
                  {option.title}
                  <ArrowRight
                    size={18}
                    className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all"
                  />
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Setting;
