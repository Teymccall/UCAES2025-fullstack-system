"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useCourses } from "@/components/course-context"
import { ProgramsService } from "@/lib/firebase-service"

type Item = {
  code: string
  title: string
  credits: number
  level: number
  semester: string
  department?: string
}

function normalize(code: string) {
  return code.replace(/\s+/g, "").toUpperCase()
}

export default function AlignProgramsPage() {
  const { programs, upsertCourses, bulkAssignToProgram } = useCourses()
  const { toast } = useToast()
  const [yearKey, setYearKey] = useState("all")
  const [isBusy, setIsBusy] = useState(false)

  const findProgramId = (name: string) => programs.find(p => p.name.trim().toLowerCase() === name.trim().toLowerCase())?.id || ""

  // Utility: persist mapping to program document so other clients get it immediately
  const persistMapping = async (programId: string, level: string, semester: string, year: string, studyMode: string, codes: string[]) => {
    try {
      const program = programs.find(p => p.id === programId)
      if (!program) return
      const next = { ...(program as any) }
      if (!next.coursesPerLevel) next.coursesPerLevel = {}
      if (!next.coursesPerLevel[level]) next.coursesPerLevel[level] = {}
      if (!next.coursesPerLevel[level][semester]) next.coursesPerLevel[level][semester] = {}
      if (!next.coursesPerLevel[level][semester][year]) next.coursesPerLevel[level][semester][year] = {}
      if (!next.coursesPerLevel[level][semester][year][studyMode]) next.coursesPerLevel[level][semester][year][studyMode] = []
      const setCodes = new Set<string>(next.coursesPerLevel[level][semester][year][studyMode])
      codes.forEach(c => setCodes.add(c))
      next.coursesPerLevel[level][semester][year][studyMode] = Array.from(setCodes)
      await ProgramsService.update(programId, { coursesPerLevel: next.coursesPerLevel } as any)
    } catch (e) {
      // silent; UI will still reflect in-memory state via bulkAssignToProgram
    }
  }

  const upsertAndAssign = async (programName: string, blocks: Array<{ level: number; semester: string; items: Item[] }>) => {
    const programId = findProgramId(programName)
    if (!programId) {
      toast({ title: "Program not found", description: programName, variant: "destructive" })
      return
    }
    setIsBusy(true)
    try {
      // Upsert catalog
      const itemsFlat = blocks.flatMap(b => b.items.map(i => ({
        code: normalize(i.code),
        title: i.title,
        name: i.title,
        credits: i.credits,
        level: b.level,
        semester: b.semester === "First Semester" ? "1" : "2",
        department: i.department || undefined,
      })))
      await upsertCourses(itemsFlat)

      // Assign per block
      for (const block of blocks) {
        const codes = block.items.map(i => normalize(i.code))
        await bulkAssignToProgram(programId, String(block.level), block.semester, yearKey, codes, "Regular")
        // Persist to program document
        await persistMapping(programId, String(block.level), block.semester, yearKey, "Regular", codes)
      }
      toast({ title: "Aligned", description: `${programName} mapped for year key "${yearKey}"` })
    } catch (e: any) {
      toast({ title: "Alignment failed", description: e?.message || String(e), variant: "destructive" })
    } finally {
      setIsBusy(false)
    }
  }

  const alignSustainableAgriculture = async () => {
    const L1S1: Item[] = [
      { code: "AGM 151", title: "Introduction to Soil Science", credits: 3, level: 100, semester: "First Semester" },
      { code: "AGM 153", title: "Introductory Botany", credits: 2, level: 100, semester: "First Semester" },
      { code: "AGM 155", title: "Principles of Crop Production", credits: 2, level: 100, semester: "First Semester" },
      { code: "ESM 151", title: "Principles of Biochemistry", credits: 3, level: 100, semester: "First Semester" },
      { code: "ESM 155", title: "Introduction to Climatology", credits: 2, level: 100, semester: "First Semester" },
      { code: "GNS 151", title: "Introductory Pure Mathematics", credits: 2, level: 100, semester: "First Semester" },
      { code: "GNS 153", title: "Introduction to Computing I", credits: 2, level: 100, semester: "First Semester" },
      { code: "GNS 155", title: "Communication Skills I", credits: 2, level: 100, semester: "First Semester" },
    ]
    const L1S2: Item[] = [
      { code: "AGM 158", title: "Introductory Economics", credits: 2, level: 100, semester: "Second Semester" },
      { code: "AGM 152", title: "Principles of Land Surveying", credits: 2, level: 100, semester: "Second Semester" },
      { code: "AGM 154", title: "Principles of Agroecology", credits: 1, level: 100, semester: "Second Semester" },
      { code: "AGM 156", title: "Vacation Training", credits: 3, level: 100, semester: "Second Semester" },
      { code: "ANS 152", title: "Anatomy and Physiology of Farm Animals", credits: 3, level: 100, semester: "Second Semester" },
      { code: "ESM 156", title: "Basic Microbiology", credits: 3, level: 100, semester: "Second Semester" },
      { code: "GNS 152", title: "Basic Statistics", credits: 2, level: 100, semester: "Second Semester" },
      { code: "GNS 154", title: "Introduction to Computing II", credits: 2, level: 100, semester: "Second Semester" },
      { code: "GNS 156", title: "Communication Skills II", credits: 2, level: 100, semester: "Second Semester" },
    ]
    const L2S1: Item[] = [
      { code: "AGM 265", title: "Rural Sociology", credits: 2, level: 200, semester: "First Semester" },
      { code: "AGM 251", title: "Farming Systems and Natural Resources", credits: 2, level: 200, semester: "First Semester" },
      { code: "AGM 253", title: "Crop Physiology", credits: 2, level: 200, semester: "First Semester" },
      { code: "AGM 255", title: "Introduction to Plant Pathology", credits: 2, level: 200, semester: "First Semester" },
      { code: "AGM 257", title: "Principles of Plant Breeding", credits: 2, level: 200, semester: "First Semester" },
      { code: "AGM 259", title: "Agricultural Power Sources and Mechanization", credits: 2, level: 200, semester: "First Semester" },
      { code: "AGM 261", title: "Introduction to Entomology", credits: 2, level: 200, semester: "First Semester" },
      { code: "AGM 263", title: "Soil Microbiology", credits: 2, level: 200, semester: "First Semester" },
    ]
    const L2S2: Item[] = [
      { code: "AGM 258", title: "Agricultural Economics and Marketing", credits: 3, level: 200, semester: "Second Semester" },
      { code: "AGM 260", title: "Introduction to Agric. Extension", credits: 2, level: 200, semester: "Second Semester" },
      { code: "AGM 252", title: "Arable and Plantation Crop Production", credits: 2, level: 200, semester: "Second Semester" },
      { code: "AGM 254", title: "Soil Conservation and Fertility Management", credits: 2, level: 200, semester: "Second Semester" },
      { code: "AGM 256", title: "Weed Science", credits: 2, level: 200, semester: "Second Semester" },
      { code: "ANS 252", title: "Poultry Production and Management", credits: 2, level: 200, semester: "Second Semester" },
      { code: "ANS 254", title: "Principles of Animal Nutrition", credits: 2, level: 200, semester: "Second Semester" },
      { code: "AGM 262", title: "Fruit and Vegetable Crop Production", credits: 2, level: 200, semester: "Second Semester" },
    ]
    const L3S1: Item[] = [
      { code: "AGM 355", title: "Farm Management and Agribusiness", credits: 2, level: 300, semester: "First Semester" },
      { code: "AGM 351", title: "Principles of Crop Pest Control & Disease Mgt.", credits: 2, level: 300, semester: "First Semester" },
      { code: "AGM 353", title: "Integrated Crop Protection Management", credits: 2, level: 300, semester: "First Semester" },
      { code: "ANS 351", title: "Forage Production", credits: 2, level: 300, semester: "First Semester" },
      { code: "ANS 353", title: "Swine Production and Management", credits: 2, level: 300, semester: "First Semester" },
      { code: "ANS 355", title: "Animal Health and Diseases", credits: 2, level: 300, semester: "First Semester" },
      { code: "GNS 351", title: "Experimental Design and Analysis", credits: 3, level: 300, semester: "First Semester" },
    ]
    const L3S2: Item[] = [
      { code: "AGM 352", title: "Agricultural Law and Policy", credits: 2, level: 300, semester: "Second Semester" },
      { code: "ANS 352", title: "Ruminant Production and Management", credits: 3, level: 300, semester: "Second Semester" },
      { code: "AGM 354", title: "Entrepreneurship Development", credits: 2, level: 300, semester: "Second Semester" },
      { code: "ESM 258", title: "Introduction to Remote Sensing and GIS", credits: 3, level: 300, semester: "Second Semester" },
      { code: "GNS 352", title: "Research Methodology and Techniques", credits: 2, level: 300, semester: "Second Semester" },
      { code: "GNS 356", title: "Industrial Attachment", credits: 2, level: 300, semester: "Second Semester" },
      { code: "AGM 356", title: "Amenity and Ornamental Horticulture", credits: 2, level: 300, semester: "Second Semester" },
      { code: "AGM 358", title: "Introduction to Post Harvest Science", credits: 3, level: 300, semester: "Second Semester" },
    ]

    await upsertAndAssign("BSc. Sustainable Agriculture", [
      { level: 100, semester: "First Semester", items: L1S1 },
      { level: 100, semester: "Second Semester", items: L1S2 },
      { level: 200, semester: "First Semester", items: L2S1 },
      { level: 200, semester: "Second Semester", items: L2S2 },
      { level: 300, semester: "First Semester", items: L3S1 },
      { level: 300, semester: "Second Semester", items: L3S2 },
    ])
  }

  const alignESM = async () => {
    const L1S1: Item[] = [
      { code: "ESM 151", title: "Principles of Biochemistry", credits: 3, level: 100, semester: "First Semester" },
      { code: "ESM 153", title: "Principles of Environmental Science I", credits: 2, level: 100, semester: "First Semester" },
      { code: "ESM 155", title: "Introduction to Climatology", credits: 2, level: 100, semester: "First Semester" },
      { code: "AGM 151", title: "Introduction to Soil Science", credits: 3, level: 100, semester: "First Semester" },
      { code: "GNS 151", title: "Basic Mathematics", credits: 2, level: 100, semester: "First Semester" },
      { code: "GNS 153", title: "Introduction to Computing I", credits: 2, level: 100, semester: "First Semester" },
      { code: "GNS 155", title: "Communication Skills I", credits: 2, level: 100, semester: "First Semester" },
    ]
    const L1S2: Item[] = [
      { code: "ESM 152", title: "Principles of Environmental Science II", credits: 2, level: 100, semester: "Second Semester" },
      { code: "ESM 154", title: "Environment and Development", credits: 2, level: 100, semester: "Second Semester" },
      { code: "ESM 156", title: "Basic Microbiology", credits: 3, level: 100, semester: "Second Semester" },
      { code: "AGM 152", title: "Principles of Land Surveying", credits: 2, level: 100, semester: "Second Semester" },
      { code: "ESM 158", title: "Introductory Economics", credits: 2, level: 100, semester: "Second Semester" },
      { code: "GNS 152", title: "Basic Statistics", credits: 2, level: 100, semester: "Second Semester" },
      { code: "GNS 154", title: "Introduction to Computing II", credits: 2, level: 100, semester: "Second Semester" },
      { code: "GNS 156", title: "Communication Skills II", credits: 2, level: 100, semester: "Second Semester" },
    ]
    const L2S1: Item[] = [
      { code: "ESM 251", title: "Geology", credits: 3, level: 200, semester: "First Semester" },
      { code: "ESM 253", title: "Principles of Land Economy", credits: 2, level: 200, semester: "First Semester" },
      { code: "ESM 255", title: "Hydrology", credits: 2, level: 200, semester: "First Semester" },
      { code: "ESM 257", title: "Oceanography", credits: 3, level: 200, semester: "First Semester" },
      { code: "ESM 259", title: "Rural Sociology", credits: 2, level: 200, semester: "First Semester" },
      { code: "GNS 251", title: "Fundamentals of Planning", credits: 2, level: 200, semester: "First Semester" },
      { code: "GNS 253", title: "Principles of Law", credits: 2, level: 200, semester: "First Semester" },
    ]
    const L2S2: Item[] = [
      { code: "ESM 252", title: "Introduction to Environmental Engineering", credits: 3, level: 200, semester: "Second Semester" },
      { code: "ESM 254", title: "Environment and Sustainability", credits: 2, level: 200, semester: "Second Semester" },
      { code: "ESM 256", title: "Agroecology", credits: 2, level: 200, semester: "Second Semester" },
      { code: "ESM 258", title: "Remote Sensing and GIS", credits: 3, level: 200, semester: "Second Semester" },
      { code: "ESM 260", title: "Introduction to Resource Analysis", credits: 2, level: 200, semester: "Second Semester" },
      { code: "ESM 262", title: "Introduction to Waste Management", credits: 3, level: 200, semester: "Second Semester" },
      { code: "ESM 264", title: "Introduction to Limnology", credits: 3, level: 200, semester: "Second Semester" },
    ]
    const L3S1: Item[] = [
      { code: "ESM 351", title: "Environmental Quality Analysis", credits: 3, level: 300, semester: "First Semester" },
      { code: "ESM 353", title: "Environmental Law and Policy", credits: 2, level: 300, semester: "First Semester" },
      { code: "ESM 355", title: "Climate Change", credits: 2, level: 300, semester: "First Semester" },
      { code: "ESM 357", title: "Environmental Pollution and Toxicology", credits: 2, level: 300, semester: "First Semester" },
      { code: "ESM 359", title: "Integrated Water Resources Management", credits: 3, level: 300, semester: "First Semester" },
      { code: "GNS 351", title: "Experimental Design and Analysis", credits: 3, level: 300, semester: "First Semester" },
    ]
    const L3S2: Item[] = [
      { code: "ESM 352", title: "Environmental Auditing and Assessment", credits: 3, level: 300, semester: "Second Semester" },
      { code: "ESM 354", title: "Ecological and Environmental Economics", credits: 3, level: 300, semester: "Second Semester" },
      { code: "ESM 356", title: "Mining and Mineral Resources", credits: 2, level: 300, semester: "Second Semester" },
      { code: "ESM 358", title: "Environment and Health", credits: 2, level: 300, semester: "Second Semester" },
      { code: "GNS 352", title: "Research Methodology and Techniques", credits: 2, level: 300, semester: "Second Semester" },
      { code: "ESM 360", title: "Project Management", credits: 2, level: 300, semester: "Second Semester" },
      { code: "ESM 362", title: "Entrepreneurship Development", credits: 2, level: 300, semester: "Second Semester" },
    ]

    await upsertAndAssign("BSc. Environmental Science and Management", [
      { level: 100, semester: "First Semester", items: L1S1 },
      { level: 100, semester: "Second Semester", items: L1S2 },
      { level: 200, semester: "First Semester", items: L2S1 },
      { level: 200, semester: "Second Semester", items: L2S2 },
      { level: 300, semester: "First Semester", items: L3S1 },
      { level: 300, semester: "Second Semester", items: L3S2 },
    ])
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Align Programs with Course Structures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-sm font-medium">Year Key (mapping bucket)</label>
              <Input value={yearKey} onChange={e=>setYearKey(e.target.value)} placeholder="all" />
              <p className="text-xs text-muted-foreground mt-1">Mappings are stored under this year key; selection is merged across years at runtime.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button disabled={isBusy} onClick={alignSustainableAgriculture}>Align BSc. Sustainable Agriculture</Button>
            <Button disabled={isBusy} onClick={alignESM}>Align BSc. Environmental Science and Management</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


