"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Tag
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

// --- DUMMY DATA DENGAN KATEGORI ---
const INITIAL_PROGRAMS = [
  { id: 1, code: "BSI-PRO-01", title: "BSI Corporate Growth", category: "Education", domain: "bsi.ac.id", type: "Flat", value: "Rp 250k", status: "Active" },
  { id: 2, code: "GLB-TRF-22", title: "Global Traffic Harvester", category: "Fintech", domain: "Public", type: "Dynamic", value: "15%", status: "Active" },
  { id: 3, code: "MKT-DRFT", title: "Marketing Sandbox", category: "E-Commerce", domain: "internal.io", type: "Flat", value: "Rp 100k", status: "Draft" },
];

const CATEGORIES = ["Education", "Fintech", "E-Commerce", "SaaS", "Real Estate"];

export default function AffiliateProgramsPage() {
  const [programs, setPrograms] = useState(INITIAL_PROGRAMS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "", code: "", category: "Education", domain: "", type: "Flat", value: "", status: "Active"
  });

  const openAddModal = () => {
    setEditingProgram(null);
    setFormData({ title: "", code: "", category: "Education", domain: "", type: "Flat", value: "", status: "Active" });
    setIsModalOpen(true);
  };

  const openEditModal = (prog: any) => {
    setEditingProgram(prog);
    setFormData(prog);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingProgram) {
      setPrograms(programs.map(p => p.id === editingProgram.id ? { ...formData, id: p.id } : p));
    } else {
      setPrograms([...programs, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus program ini secara permanen?")) {
      setPrograms(programs.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] p-4 md:p-10 space-y-8 font-sans transition-all">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#4A90E2]/10 p-4 rounded-2xl">
            <Layers className="text-[#4A90E2] h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#4A90E2] tracking-tighter uppercase leading-none">
              All <span className="text-[#F2A93B]">Programs</span>
            </h1>
            <p className="text-sm text-[#8E8E8E] font-bold mt-1 uppercase tracking-widest">Campaign & Asset Management</p>
          </div>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-[#7ED321] hover:bg-[#6ab21d] text-white px-8 py-7 rounded-2xl font-black shadow-lg shadow-green-500/20 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> TAMBAH PROGRAM
        </Button>
      </div>

      {/* SEARCH & TABLE */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E8E] h-4 w-4" />
            <Input 
              placeholder="Cari nama atau kode program..." 
              className="pl-12 bg-gray-50 border-none rounded-2xl h-14 font-medium focus-visible:ring-[#4A90E2]"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-10 font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Info Program</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Kategori</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Domain</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Komisi</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-center font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Kelola</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((prog) => (
                  <TableRow key={prog.id} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-50">
                    <TableCell className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-[#1A1A1A] tracking-tighter leading-tight">{prog.title}</span>
                        <span className="text-[10px] font-bold text-[#4A90E2] uppercase tracking-widest mt-0.5">{prog.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[#8E8E8E]">
                        <Tag size={12} className="text-[#F2A93B]" />
                        <span className="text-xs font-black uppercase tracking-widest">{prog.category}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-gray-100 text-[#8E8E8E] rounded-lg text-[10px] font-bold italic uppercase tracking-tighter">@{prog.domain}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`text-base font-black ${prog.type === 'Flat' ? 'text-[#7ED321]' : 'text-[#F2A93B]'}`}>{prog.value}</span>
                        <span className="text-[9px] font-bold text-[#8E8E8E] uppercase tracking-tighter">{prog.type} Based</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {prog.status === 'Active' ? (
                        <Badge className="bg-[#7ED321] text-white rounded-full text-[9px] font-black px-3 py-1"><CheckCircle2 size={10} className="mr-1.5" /> ACTIVE</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200 text-[#8E8E8E] rounded-full text-[9px] font-black px-3 py-1"><AlertCircle size={10} className="mr-1.5" /> DRAFT</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button 
                          onClick={() => openEditModal(prog)}
                          className="bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl h-10 px-5 font-bold text-xs shadow-md shadow-blue-500/10 transition-all active:scale-95"
                        >
                          <Pencil size={14} className="mr-2" /> UBAH
                        </Button>
                        <Button 
                          onClick={() => handleDelete(prog.id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-10 px-5 font-bold text-xs shadow-md shadow-red-500/10 transition-all active:scale-95"
                        >
                          <Trash2 size={14} className="mr-2" /> HAPUS
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

      {/* --- MODAL FORM --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-[#4A90E2] p-10 text-white">
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
              {editingProgram ? "Update" : "Create"} <span className="text-[#F2A93B]">Program</span>
            </DialogTitle>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Classification & Asset Mapping</p>
          </DialogHeader>
          
          <div className="p-10 space-y-6 bg-white">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Nama Program</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none h-14 font-bold text-lg px-6 focus:ring-2 ring-[#4A90E2]/20" 
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Kode Program</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none h-14 font-mono font-bold uppercase px-6" 
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Kategori</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger className="rounded-2xl bg-gray-50 border-none h-14 font-black px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="font-bold text-xs">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Target Domain</Label>
                <Input 
                  value={formData.domain} 
                  onChange={(e) => setFormData({...formData, domain: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none h-14 italic px-6" 
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="rounded-2xl bg-gray-50 border-none h-14 font-black px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Tipe Komisi</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="rounded-2xl bg-gray-50 border-none h-14 font-black px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="Flat">Flat Based</SelectItem>
                    <SelectItem value="Dynamic">Dynamic (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Nilai Komisi</Label>
                <Input 
                  value={formData.value} 
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none h-14 font-black text-[#7ED321] text-lg px-6" 
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 bg-gray-50 flex gap-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-2xl font-black text-[#8E8E8E] h-14 px-8">BATAL</Button>
            <Button onClick={handleSave} className="flex-grow bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-2xl font-black h-14 shadow-lg shadow-blue-500/20 uppercase tracking-widest">
              SIMPAN PROGRAM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}