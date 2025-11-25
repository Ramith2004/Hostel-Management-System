import { motion } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ComplaintForm } from "../../../Components/Complaints/ComplaintForm";


export const SubmitComplaint = () => {
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleSuccess = () => {
    setShowForm(false);
    // Optionally refresh the complaints list
    window.location.reload();
  };

  return (
    <motion.div
      className="min-h-screen bg-background p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Submit a Complaint
          </h1>
          <p className="text-muted-foreground">
            Report any issues or concerns related to your hostel room or facilities
          </p>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-md mb-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          New Complaint
        </motion.button>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {[
            {
              title: "Quick Response",
              description: "Get acknowledged within 24 hours",
              icon: "⚡",
            },
            {
              title: "Track Progress",
              description: "Monitor your complaint status in real-time",
              icon: "📊",
            },
            {
              title: "Transparent Process",
              description: "Receive updates through comments and timeline",
              icon: "🔍",
            },
          ].map((card, index) => (
            <motion.div
              key={index}
              className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Guidelines */}
        <motion.div
          className="bg-primary/10 border border-primary/20 rounded-xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-primary mb-4">
            Guidelines for Filing Complaints
          </h3>
          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Be specific about the issue and its location</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Provide relevant details for better resolution</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Choose appropriate category and priority</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Attach photos if applicable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Follow up on your complaint regularly</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <ComplaintForm
          tenantId={user?.tenantId || ""}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}
    </motion.div>
  );
};