import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Link() {
  return (
    <main className="flex flex-col h-screen w-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Enter your team id.</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="teamid">Team Id</Label>
                <Input id="teamid" placeholder="44421" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button>Submit</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
