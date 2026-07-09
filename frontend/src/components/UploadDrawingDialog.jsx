import { useState } from "react"
import { toast } from "sonner"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog"

export default function UploadDrawingDialog({ onUploaded }) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [projectName, setProjectName] = useState("")
  const [drawingNumber, setDrawingNumber] = useState("")
  const [remarks, setRemarks] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setFile(null)
    setProjectName("")
    setDrawingNumber("")
    setRemarks("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error("Please select a file")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("projectName", projectName)
    formData.append("drawingNumber", drawingNumber)
    formData.append("remarks", remarks)

    setSubmitting(true)
    try {
      await api.post("/drawings", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      toast.success("Drawing uploaded successfully")
      resetForm()
      setOpen(false)
      onUploaded?.()
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload Drawing</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Drawing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File (JPG, PNG, or PDF)</Label>
            <Input
              id="file"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="drawingNumber">Drawing Number</Label>
            <Input
              id="drawingNumber"
              value={drawingNumber}
              onChange={(e) => setDrawingNumber(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (optional)</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}