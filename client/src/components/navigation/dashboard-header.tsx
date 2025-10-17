import { Search, Bell, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  userName?: string;
  userInitials?: string;
  walletBalance?: number;
  onWalletClick?: () => void;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onSearch?: (query: string) => void;
}

export default function DashboardHeader({
  userName = "User",
  userInitials = "U",
  walletBalance = 0,
  onWalletClick,
  onProfileClick,
  onNotificationsClick,
  onSearch,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16 sm:h-20">
        {/* Search Bar */}
        <div className="flex-1 max-w-md sm:max-w-lg lg:max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search"
              className="pl-10 pr-4 w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-primary transition-colors"
              onChange={(e) => onSearch?.(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {/* Right Section: Wallet, Avatar, Notifications */}
        <div className="flex items-center gap-2 sm:gap-4 ml-4">
          {/* Wallet */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white border-none px-3 sm:px-4"
                  onClick={onWalletClick}
                  data-testid="button-wallet"
                >
                  <Wallet className="h-4 w-4" />
                  <span className="font-semibold text-sm sm:text-base">
                    {walletBalance.toFixed(2)}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Wallet Balance</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Avatar */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onProfileClick}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors font-semibold text-gray-700 text-sm sm:text-base"
                  data-testid="button-profile"
                >
                  {userInitials}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{userName}'s Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100"
                  onClick={onNotificationsClick}
                  data-testid="button-notifications"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
