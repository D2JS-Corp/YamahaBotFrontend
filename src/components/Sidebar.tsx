import { Home, Gamepad2, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { icon: Home, label: "Overview", path: "/" },
    { icon: Gamepad2, label: "Control", path: "/control" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <img
            src="/yamaha_logo.png"
            alt="Yamaha Logo"
            className="w-50 h-12"
          />
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium text-foreground">Robot Monitor</p>
          <p className="text-xs text-muted-foreground">Museum Display</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.label} to={item.path}>
              <Button
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className={`w-full justify-start h-11 ${
                  location.pathname === item.path
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start h-11 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;