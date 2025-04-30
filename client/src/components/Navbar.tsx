import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Menu, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";
import { useQuery } from "@tanstack/react-query";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  
  // In a real app, we would fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      // This would fetch from the API in a real app
      return [];
    },
    enabled: !!user,
  });
  
  const unreadNotifications = notifications.filter((n: any) => !n.isRead);
  
  useEffect(() => {
    // Close mobile menu when location changes
    setMobileMenuOpen(false);
  }, [location]);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const userInitials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("")
    : user?.username?.[0] || "U";
  
  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/transactions", label: "Transactions" },
    { path: "/messages", label: "Messages" },
  ];
  
  return (
    <nav className="gradient-bg text-white shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <span className="material-icons gradient-text">security</span>
            </div>
            <span className="text-2xl font-poppins font-bold">Middlesman</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`py-4 px-2 font-medium transition duration-300 ${
                  location === link.path
                    ? "text-accent"
                    : "hover:text-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          {/* User Menu */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* Theme Switcher */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-white hover:text-accent"
              >
                <span className="material-icons">
                  {theme === "dark" ? "light_mode" : "dark_mode"}
                </span>
              </Button>
              
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-white hover:text-accent">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications.length > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 bg-accent text-xs h-4 w-4 flex items-center justify-center notification-badge"
                        variant="secondary"
                      >
                        {unreadNotifications.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {unreadNotifications.length === 0 ? (
                    <div className="py-4 px-2 text-center text-sm text-gray-500">
                      No new notifications
                    </div>
                  ) : (
                    <>
                      {/* We'd map through notifications in a real app */}
                      <DropdownMenuItem className="cursor-pointer">
                        New notification
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="cursor-pointer w-full text-center">
                      View all notifications
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 text-white hover:text-accent"
                  >
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={user.avatarUrl} alt={user.fullName || user.username} />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block">{user.fullName || user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    {logoutMutation.isPending ? "Logging out..." : "Sign out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden text-white hover:text-accent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth">
                <Button variant="ghost" className="text-white hover:text-accent">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-white text-primary-dark hover:bg-gray-100">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "block" : "hidden"}`}>
          <div className="flex flex-col space-y-2 pt-2 pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`py-2 px-2 font-medium transition duration-300 ${
                  location === link.path
                    ? "text-accent"
                    : "hover:text-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
