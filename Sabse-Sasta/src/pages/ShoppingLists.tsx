import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { shoppingListsAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Eye, Calendar } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ShoppingList {
  id?: string;
  list_id?: string;
  name?: string;
  list_name?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
}

const ShoppingLists = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    fetchLists();
  }, [isAuthenticated, navigate]);

  const fetchLists = async () => {
    try {
      const data = await shoppingListsAPI.getAll();
      // Transform backend data to frontend format
      const transformedLists = (data || []).map((list: any) => ({
        id: list.list_id?.toString() || list.id,
        list_id: list.list_id,
        name: list.list_name || list.name,
        list_name: list.list_name,
        created_at: list.createdAt || list.created_at,
        updated_at: list.updatedAt || list.updated_at,
      }));
      setLists(transformedLists);
    } catch (error: any) {
      console.error("Error fetching lists:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load shopping lists",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteListId) return;

    try {
      await shoppingListsAPI.delete(deleteListId);

      toast({
        title: "Success",
        description: "Shopping list deleted",
      });

      fetchLists();
    } catch (error: any) {
      console.error("Error deleting list:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete shopping list",
        variant: "destructive",
      });
    } finally {
      setDeleteListId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Shopping Lists</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage your shopping lists for bulk cost estimates
              </p>
            </div>
            <Button onClick={() => navigate("/shopping-lists/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New List
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading your lists...</p>
            </div>
          ) : lists.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  You don't have any shopping lists yet
                </p>
                <Button onClick={() => navigate("/shopping-lists/new")}>
                  Create Your First List
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {lists.map((list) => (
                <Card
                  key={list.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/shopping-lists/${list.id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{list.name || list.list_name || 'Untitled List'}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-2">
                          <Calendar className="h-3 w-3" />
                          Created {new Date(list.created_at || list.createdAt || Date.now()).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/shopping-lists/${list.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteListId(list.id || null);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AlertDialog open={!!deleteListId} onOpenChange={() => setDeleteListId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shopping List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShoppingLists;