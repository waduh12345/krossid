"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Layers, 
  Tag, 
  FolderOpen, 
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// --- DUMMY DATA CATEGORIES ---
const INITIAL_CATEGORIES = [
  { id: 1, name: "Education", slug: "education", description: "Program untuk kursus, bimbingan belajar, dan edutech.", count: 12, status: "Active" },
  { id: 2, name: "Fintech", slug: "fintech", description: "Layanan keuangan, dompet digital, dan investasi.", count: 8, status: "Active" },
  { id: 3, name: "E-Commerce", slug: "e-commerce", description: "Produk retail dan marketplace fisik.", count: 24, status: "Active" },
  { id: 4, name: "SaaS", slug: "saas", description: "Software as a Service dan alat produktivitas digital.", count: 5, status: "Inactive" },
];

export default function ProgramCategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "", slug: "", description: "", status: "Active"
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "", status: "Active" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingCategory(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...formData, id: c.id, count: c.count } : c));
    } else {
      setCategories([...categories, { ...formData, id: Date.now(), count: 0 } as any]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus kategori ini? Program di dalamnya mungkin akan kehilangan klasifikasi.")) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] p-4 md:p-10 space-y-8 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#F2A93B]/10 p-4 rounded-2xl">
            <Layers className="text-[#F2A93B] h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#4A90E2] tracking-tighter uppercase leading-none">
              Program <span className="text-[#F2A93B]">Categories</span>
            </h1>
            <p className="text-sm text-[#8E8E8E] font-bold mt-1 uppercase tracking-widest">Classify Your Affiliate Assets</p>
          </div>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-[#4A90E2] hover:bg-[#357ABD] text-white px-8 py-7 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> TAMBAH KATEGORI
        </Button>
      </div>

      {/* SEARCH & STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E8E] h-5 w-5" />
          <Input 
            placeholder="Cari nama kategori..." 
            className="pl-14 bg-white border-none rounded-[1.5rem] h-14 shadow-sm focus-visible:ring-[#4A90E2] font-medium"
          />
        </div>
        <div className="lg:col-span-4 flex justify-end">
          <Badge className="bg-white text-[#4A90E2] border-gray-100 px-6 py-3 rounded-xl shadow-sm font-black text-xs tracking-widest uppercase">
            Total Groups: {categories.length}
          </Badge>
        </div>
      </div>

      {/* CATEGORY TABLE */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-10 font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Nama & Slug</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Deskripsi</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest text-center">Program Aktif</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-center font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Kelola</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-orange-50/20 transition-colors border-b border-gray-50">
                    <TableCell className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#4A90E2]/5 p-2.5 rounded-xl">
                          <Tag size={18} className="text-[#4A90E2]" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-base font-black text-[#1A1A1A]">{item.name}</span>
                          <span className="text-[10px] font-bold text-[#8E8E8E] flex items-center gap-1 uppercase tracking-tighter">
                            <LinkIcon size={10} /> /{item.slug}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-[#8E8E8E] max-w-xs leading-relaxed font-medium">{item.description}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-lg font-black text-[#4A90E2]">{item.count}</span>
                        <span className="text-[9px] font-bold text-[#8E8E8E] uppercase">Programs</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.status === 'Active' ? (
                        <Badge className="bg-[#7ED321] text-white rounded-full text-[9px] font-black tracking-widest py-1 px-3">
                          <CheckCircle2 size={10} className="mr-1.5" /> ACTIVE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200 text-[#8E8E8E] rounded-full text-[9px] font-black tracking-widest py-1 px-3">
                          <XCircle size={10} className="mr-1.5" /> INACTIVE
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button 
                          onClick={() => openEditModal(item)}
                          className="bg-white hover:bg-[#4A90E2] text-[#4A90E2] hover:text-white border border-[#4A90E2] rounded-xl h-10 w-10 p-0 transition-all"
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(item.id)}
                          className="bg-white hover:bg-red-500 text-red-500 hover:text-white border border-red-500 rounded-xl h-10 w-10 p-0 transition-all"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* --- MODAL FORM (CATEGORIES) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-[#F2A93B] p-10 text-white relative">
            <div className="absolute right-8 top-10 opacity-10">
              <FolderOpen size={100} />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
              {editingCategory ? "Update" : "New"} <span className="text-[#4A90E2]">Category</span>
            </DialogTitle>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Organize Your Affiliate Ecosystem</p>
          </DialogHeader>
          
          <div className="p-10 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1">Nama Kategori</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Fintech"
                    className="rounded-2xl bg-gray-50 border-none h-14 font-black text-[#1A1A1A] px-6" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1">URL Slug</Label>
                  <Input 
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    placeholder="fintech-service"
                    className="rounded-2xl bg-gray-50 border-none h-14 font-mono text-xs text-[#4A90E2] px-6" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1">Deskripsi Singkat</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none min-h-[100px] p-6 text-sm font-medium focus:ring-2 ring-[#F2A93B]/20" 
                  placeholder="Jelaskan tujuan kategori ini..."
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1">Status Kategori</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="rounded-2xl bg-gray-50 border-none h-14 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 bg-gray-50 flex gap-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-2xl font-black text-[#8E8E8E] h-14 px-8">TUTUP</Button>
            <Button onClick={handleSave} className="flex-grow bg-[#F2A93B] hover:bg-[#D48A2D] text-white rounded-2xl font-black h-14 shadow-lg shadow-orange-500/20 uppercase tracking-widest transition-all">
              SIMPAN KATEGORI
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}