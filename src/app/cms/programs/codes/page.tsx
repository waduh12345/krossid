"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Ticket, 
  Hash, 
  Users, 
  Percent,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter
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

// --- DUMMY DATA CAMPAIGN CODES ---
const INITIAL_CODES = [
  { id: 1, code: "MEGA-SAVE-2025", campaign: "Ramadan Sale", type: "Percentage", value: "15%", usage: 450, limit: 1000, status: "Active" },
  { id: 2, code: "FLAT-50K", campaign: "New Year Promo", type: "Fixed", value: "Rp 50.000", usage: 120, limit: 500, status: "Active" },
  { id: 3, code: "OLD-VIBES", campaign: "Flash Sale 12.12", type: "Percentage", value: "50%", usage: 1000, limit: 1000, status: "Expired" },
];

export default function CampaignCodesPage() {
  const [codes, setCodes] = useState(INITIAL_CODES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "", campaign: "", type: "Percentage", value: "", limit: "", status: "Active"
  });

  const openAddModal = () => {
    setEditingCode(null);
    setFormData({ code: "", campaign: "", type: "Percentage", value: "", limit: "", status: "Active" });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingCode(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingCode) {
      setCodes(codes.map(c => c.id === editingCode.id ? { ...formData, id: c.id, usage: c.usage, limit: Number(formData.limit) } : c));
    } else {
      setCodes([...codes, { ...formData, id: Date.now(), usage: 0, limit: Number(formData.limit) }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus kode kampanye ini secara permanen?")) {
      setCodes(codes.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] p-4 md:p-10 space-y-8 font-sans transition-all duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#4A90E2]/10 p-4 rounded-2xl">
            <Ticket className="text-[#4A90E2] h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#4A90E2] tracking-tighter uppercase leading-none">
              Campaign <span className="text-[#F2A93B]">Codes</span>
            </h1>
            <p className="text-sm text-[#8E8E8E] font-bold mt-1 uppercase tracking-widest">Referral & Promo Vouchers</p>
          </div>
        </div>
        <Button 
          onClick={openAddModal}
          className="bg-[#7ED321] hover:bg-[#6ab21d] text-white px-8 py-7 rounded-2xl font-black shadow-lg shadow-green-500/20 transition-all active:scale-95"
        >
          <Plus className="mr-2 h-5 w-5" /> BUAT KODE BARU
        </Button>
      </div>

      {/* SEARCH & FILTER */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white p-8 border-b border-gray-50 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-grow w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E8E] h-4 w-4" />
            <Input 
              placeholder="Cari kode atau nama kampanye..." 
              className="pl-12 bg-gray-50 border-none rounded-2xl h-14 focus-visible:ring-[#4A90E2] font-medium"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Badge variant="outline" className="px-6 py-3 rounded-xl bg-blue-50 text-[#4A90E2] border-blue-100 font-black uppercase text-[10px] tracking-widest">
              Total: {codes.length} Codes
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-10 font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Detail Kode</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Skema Diskon</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Penggunaan</TableHead>
                  <TableHead className="font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-center font-black text-[10px] text-[#8E8E8E] uppercase tracking-widest">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-blue-50/30 transition-colors border-b border-gray-50">
                    <TableCell className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-[#1A1A1A] tracking-tight">{item.code}</span>
                        <span className="text-[10px] font-bold text-[#4A90E2] uppercase tracking-tighter mt-0.5">{item.campaign}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`text-base font-black ${item.type === 'Percentage' ? 'text-[#F2A93B]' : 'text-[#7ED321]'}`}>{item.value}</span>
                        <span className="text-[9px] font-bold text-[#8E8E8E] uppercase">{item.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                          <span className="text-[#4A90E2]">{item.usage} Used</span>
                          <span className="text-[#8E8E8E]">Limit {item.limit}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#4A90E2] transition-all" 
                            style={{ width: `${(item.usage / item.limit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.status === 'Active' ? (
                        <Badge className="bg-[#7ED321] text-white rounded-full text-[9px] font-black tracking-widest py-1 px-3">
                          <CheckCircle2 size={10} className="mr-1.5" /> ACTIVE
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-200 text-[#8E8E8E] rounded-full text-[9px] font-black tracking-widest py-1 px-3">
                          <Clock size={10} className="mr-1.5" /> EXPIRED
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button 
                          onClick={() => openEditModal(item)}
                          className="bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-xl h-10 px-5 font-bold text-xs shadow-md shadow-blue-500/10"
                        >
                          <Pencil size={14} className="mr-2" /> UBAH
                        </Button>
                        <Button 
                          onClick={() => handleDelete(item.id)}
                          variant="destructive" 
                          className="rounded-xl h-10 px-5 font-bold text-xs bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/10"
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

      {/* --- MODAL FORM (CAMPAIGN CODES) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-[#4A90E2] p-10 text-white relative">
            <div className="absolute right-8 top-10 opacity-10">
              <Hash size={100} />
            </div>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">
              {editingCode ? "Update" : "Generate"} <span className="text-[#F2A93B]">Promo Code</span>
            </DialogTitle>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Campaign Management System v2.0</p>
          </DialogHeader>
          
          <div className="p-10 space-y-8 bg-white">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Nama Kampanye</Label>
                <Input 
                  value={formData.campaign} 
                  onChange={(e) => setFormData({...formData, campaign: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none h-14 font-bold text-[#1A1A1A] px-6 focus:ring-2 ring-[#4A90E2]/20" 
                  placeholder="Contoh: Ramadan Special Sale"
                />
              </div>
              <div className="col-span-2 space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Kode Promo (Alphanumeric)</Label>
                <Input 
                  value={formData.code} 
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none h-14 font-mono font-black uppercase text-[#4A90E2] px-6 text-lg" 
                  placeholder="EX: PROMO-2025"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Jenis Diskon</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="rounded-2xl bg-gray-50 border-none h-14 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="Percentage">Percentage (%)</SelectItem>
                    <SelectItem value="Fixed">Fixed (IDR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Nilai Diskon</Label>
                <Input 
                  value={formData.value} 
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none h-14 font-black text-[#F2A93B] px-6" 
                  placeholder="15% atau 50000"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Limit Penggunaan</Label>
                <Input 
                  type="number"
                  value={formData.limit} 
                  onChange={(e) => setFormData({...formData, limit: e.target.value})}
                  className="rounded-2xl bg-gray-50 border-none h-14 font-bold px-6" 
                  placeholder="Contoh: 1000"
                />
              </div>
              <div className="space-y-2.5">
                <Label className="text-[10px] font-black text-[#8E8E8E] uppercase ml-1 tracking-widest">Status Aktif</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="rounded-2xl bg-gray-50 border-none h-14 font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-xl">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 bg-gray-50 flex gap-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-2xl font-black text-[#8E8E8E] h-14 px-8">BATAL</Button>
            <Button onClick={handleSave} className="flex-grow bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-2xl font-black h-14 shadow-lg shadow-blue-500/20 uppercase tracking-widest">
              SIMPAN DATA KODE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}