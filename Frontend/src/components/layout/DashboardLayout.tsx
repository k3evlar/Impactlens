import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  UploadCloud, 
  History as HistoryIcon, 
  Coins, 
  Trophy, 
  BarChart3, 
  BarChart2,
  LogOut, 
  Leaf,
  Menu,
  ShoppingBag,
  Receipt
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Chatbot from "../Chatbot";
import { useWallet } from "@/hooks/use-wallet";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Upload", path: "/upload", icon: UploadCloud },
  { name: "History", path: "/history", icon: HistoryIcon },
  { name: "Credit History", path: "/credits", icon: Coins },
  { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
  { name: "Purchases", path: "/purchases", icon: Receipt },
  { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { name: "Impact", path: "/impact", icon: BarChart3 },
  { name: "ESG Dashboard", path: "/esg", icon: BarChart2 },
];

const DashboardLayout = () => {
  const [userName, setUserName] = useState<string>("");
  const { credits } = useWallet();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "User");
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout? Your active session credentials and dashboard data will be completely cleared for testing purposes.")) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.email) {
            localStorage.removeItem(`data_${user.email}`);
          }
        } catch (e) {}
      }
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop Only */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 bg-secondary/30 border-r border-border backdrop-blur-xl z-20 hidden md:flex flex-col transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-center px-4 border-b border-border/50">
          <Link to="/" className="flex items-center gap-2 group w-full justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
              <Leaf className="h-4 w-4 text-primary" />
            </div>
            {!isCollapsed && (
              <span className="font-heading text-lg font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300">
                Secure<span className="text-gradient-primary">CarbonX</span>
              </span>
            )}
          </Link>
        </div>
        
        <nav className="flex-1 flex flex-col overflow-y-auto py-6 px-3">
          <div className="space-y-2 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isCollapsed ? "justify-center px-0" : "px-3",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap transition-all duration-300">
                      {item.name}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Profile Anchor Link */}
          <div className="pt-4 mt-auto border-t border-border/50">
            <Link
              to="/profile"
              title={isCollapsed ? "My Profile" : undefined}
              className={cn(
                "flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isCollapsed ? "justify-center px-0" : "px-3",
                location.pathname === "/profile" 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center h-5 w-5 shrink-0 rounded-full overflow-hidden bg-primary/20 text-primary border-primary/30 border">
                <span className="text-[10px] uppercase font-bold">{userName?.charAt(0) || "U"}</span>
              </div>
              {!isCollapsed && (
                <span className="whitespace-nowrap transition-all duration-300">
                  My Profile
                </span>
              )}
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300",
          isCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 border-b border-border/50 bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-10 w-full">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className="hidden md:flex text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center md:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Leaf className="h-4 w-4 text-primary" />
                </div>
                <span className="font-heading text-lg font-bold">SecureCarbonX</span>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center justify-end w-full md:w-auto gap-4 ml-auto">
            <div className="flex items-center gap-4">
               <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3.5 py-1.5 text-sm font-bold text-green-500 shadow-sm whitespace-nowrap overflow-hidden transition-all duration-300">
                 💰 Credits: {credits.toFixed(2)} CC
               </span>
            </div>
            <div className="hidden sm:flex border-r border-border/50 h-6 mx-1"></div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">
              Welcome, {userName || "User"}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1">
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline font-semibold">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-6">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default DashboardLayout;
