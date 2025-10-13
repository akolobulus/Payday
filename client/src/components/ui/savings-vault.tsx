import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PiggyBank, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SavingsVault } from "@shared/schema";

interface SavingsVaultProps {
  userId: string;
}

export default function SavingsVault({ userId }: SavingsVaultProps) {
  const { toast } = useToast();
  const [targetAmount, setTargetAmount] = useState("");
  const [autoSavePercentage, setAutoSavePercentage] = useState([10]);

  const { data: vault } = useQuery<SavingsVault>({
    queryKey: ['/api/savings', userId],
  });

  const updateVaultMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/savings/update", {
        userId,
        targetAmount: targetAmount ? Math.round(parseFloat(targetAmount) * 100) : vault?.targetAmount || 0,
        autoSavePercentage: autoSavePercentage[0],
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings', userId] });
      toast({
        title: "Settings Updated",
        description: "Your savings preferences have been updated.",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/savings/withdraw", {
        userId,
        amount: Math.round(amount * 100),
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings', userId] });
      toast({
        title: "Withdrawal Successful",
        description: "Funds transferred to your wallet.",
      });
    },
  });

  const totalSaved = vault?.totalSaved || 0;
  const target = vault?.targetAmount || 0;
  const progressPercentage = target > 0 ? Math.min((totalSaved / target) * 100, 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-green-600" />
          Savings Vault
        </CardTitle>
        <CardDescription>Automatically save a portion of your earnings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Total Saved</p>
          <p className="text-4xl font-bold text-green-600">₦{(totalSaved / 100).toFixed(2)}</p>
          {target > 0 && (
            <>
              <Progress value={progressPercentage} className="mt-4 max-w-xs mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">
                {progressPercentage.toFixed(0)}% of ₦{(target / 100).toFixed(2)} goal
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="target-amount">Savings Target (₦)</Label>
            <Input
              id="target-amount"
              data-testid="input-savings-target"
              type="number"
              placeholder="Enter target amount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Auto-Save Percentage: {autoSavePercentage[0]}%</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Save {autoSavePercentage[0]}% of each gig payment automatically
            </p>
            <Slider
              data-testid="slider-auto-save"
              value={autoSavePercentage}
              onValueChange={setAutoSavePercentage}
              max={50}
              step={5}
              className="w-full"
            />
          </div>

          <Button
            data-testid="button-update-savings"
            onClick={() => updateVaultMutation.mutate()}
            className="w-full"
            disabled={updateVaultMutation.isPending}
          >
            Update Savings Settings
          </Button>
        </div>

        {totalSaved > 0 && (
          <div className="pt-4 border-t">
            <Button
              data-testid="button-withdraw-savings"
              onClick={() => withdrawMutation.mutate(totalSaved / 100)}
              variant="outline"
              className="w-full"
              disabled={withdrawMutation.isPending}
            >
              Withdraw All Savings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
