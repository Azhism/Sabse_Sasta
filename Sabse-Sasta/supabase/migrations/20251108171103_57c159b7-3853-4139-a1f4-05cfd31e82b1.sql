-- Create shopping lists table
CREATE TABLE public.shopping_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping lists
CREATE POLICY "Users can view their own shopping lists"
ON public.shopping_lists
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping lists"
ON public.shopping_lists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping lists"
ON public.shopping_lists
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping lists"
ON public.shopping_lists
FOR DELETE
USING (auth.uid() = user_id);

-- Create shopping list items table
CREATE TABLE public.shopping_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping list items
CREATE POLICY "Users can view their own shopping list items"
ON public.shopping_list_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists
  WHERE shopping_lists.id = shopping_list_items.list_id
  AND shopping_lists.user_id = auth.uid()
));

CREATE POLICY "Users can create their own shopping list items"
ON public.shopping_list_items
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.shopping_lists
  WHERE shopping_lists.id = shopping_list_items.list_id
  AND shopping_lists.user_id = auth.uid()
));

CREATE POLICY "Users can update their own shopping list items"
ON public.shopping_list_items
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists
  WHERE shopping_lists.id = shopping_list_items.list_id
  AND shopping_lists.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own shopping list items"
ON public.shopping_list_items
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.shopping_lists
  WHERE shopping_lists.id = shopping_list_items.list_id
  AND shopping_lists.user_id = auth.uid()
));

-- Add trigger for automatic timestamp updates on shopping lists
CREATE TRIGGER update_shopping_lists_updated_at
BEFORE UPDATE ON public.shopping_lists
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();