"use client";

 import { SidebarProvider } from "@/components/ui/sidebar";
-import { Toaster, useToast } from "@/components/ui/toaster";
+import { Toaster } from "@/components/ui/toaster";
 import React, { useState, useEffect, useRef } from "react";
 import { Button } from "@/components/ui/button";
 import WebSearchLink from "@/components/web-search-link";
@@ -12,6 +12,7 @@
 import {
   Select,
   SelectContent,
+import { useToast } from "@/hooks/use-toast";
   SelectItem,
   SelectTrigger,
   SelectValue,
@@ -142,4 +143,3 @@
         />
     );
 }
