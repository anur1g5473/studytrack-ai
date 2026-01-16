"use client";

import { Topic } from "@/types/database.types";
import { CheckCircle2, Circle, AlertCircle, Trash2, Edit2 } from "lucide-react";

type TopicCardProps = {
  topic: Topic;
  onEdit: (topic: Topic) => void;
  onDelete: (topicId: string) => void;
};

export function TopicCard({ topic, onEdit, onDelete }: TopicCardProps) {
  const statusIcons = {
    not_started: <Circle className="w-5 h-5 text-gray-500" />,
    in_progress: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  };

  const difficultyColors = {
    easy: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    hard: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {statusIcons[topic.status]}
            <h3 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
              {topic.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded capitalize ${difficultyColors[topic.difficulty]}`}>
              {topic.difficulty}
            </span>
            <span className="text-gray-500">
              {topic.estimated_minutes}m
            </span>
          </div>

          {topic.notes && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">
              {topic.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(topic)}
            className="p-2 text-gray-400 hover:text-indigo-400 transition-colors"
            title="Edit topic"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(topic.id)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Delete topic"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}