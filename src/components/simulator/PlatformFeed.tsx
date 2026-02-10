import { motion } from "framer-motion";
import { Heart, MessageCircle, Send, Bookmark, Share2, Repeat2, Eye, MoreHorizontal, ThumbsUp, Music } from "lucide-react";
import type { SimMetrics } from "@/data/simulatorData";

interface Props {
  platform: "instagram" | "linkedin" | "twitter" | "tiktok";
  userPost: string;
  visualDescription?: string;
  metrics: SimMetrics;
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/* ─── Instagram Feed ─── */
function InstagramFeed({ userPost, visualDescription, metrics }: Omit<Props, "platform">) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden text-black shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[9px] font-bold text-black">TÚ</div>
          </div>
          <span className="text-[13px] font-semibold">tu_marca</span>
        </div>
        <MoreHorizontal className="w-5 h-5 text-black/60" />
      </div>

      {/* Image area */}
      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
        {visualDescription ? (
          <div className="p-6 text-center">
            <p className="text-[11px] text-gray-500 mb-1 font-medium uppercase tracking-wide">Imagen descrita</p>
            <p className="text-sm text-gray-700 leading-relaxed italic">"{visualDescription}"</p>
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 rounded-xl bg-gray-300/50 mx-auto mb-2 flex items-center justify-center text-2xl">📸</div>
            <p className="text-xs">Imagen del post</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pt-2.5 pb-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <MessageCircle className="w-6 h-6 text-black/80" />
            <Send className="w-6 h-6 text-black/80" />
          </div>
          <Bookmark className="w-6 h-6 text-black/80" />
        </div>
        <p className="text-[13px] font-semibold mb-1">{fmt(metrics.likes)} Me gusta</p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <p className="text-[13px] leading-[1.4]">
          <span className="font-semibold">tu_marca </span>
          <span className="text-black/90 whitespace-pre-wrap">{userPost}</span>
        </p>
        <p className="text-[11px] text-gray-400 mt-1.5">
          Ver los {metrics.comments} comentarios
        </p>
      </div>
    </div>
  );
}

/* ─── LinkedIn Feed ─── */
function LinkedInFeed({ userPost, metrics }: Omit<Props, "platform">) {
  return (
    <div className="bg-white rounded-xl overflow-hidden text-black shadow-lg">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start gap-2.5">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">TÚ</div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-black">Tu Nombre</p>
            <p className="text-[11px] text-gray-500 leading-tight">Profesional de marketing | Estratega digital</p>
            <p className="text-[10px] text-gray-400 mt-0.5">2h · 🌐</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-[14px] text-black/90 leading-[1.5] whitespace-pre-wrap">{userPost}</p>
      </div>

      {/* Reactions bar */}
      <div className="px-4 pb-2 flex items-center justify-between text-[11px] text-gray-500 border-b border-gray-100">
        <span>👍❤️🎉 {fmt(metrics.likes)}</span>
        <div className="flex gap-2">
          <span>{metrics.comments} comentarios</span>
          <span>·</span>
          <span>{metrics.shares} compartidos</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 px-2 py-1">
        {[
          { icon: <ThumbsUp className="w-4 h-4" />, label: "Recomendar" },
          { icon: <MessageCircle className="w-4 h-4" />, label: "Comentar" },
          { icon: <Repeat2 className="w-4 h-4" />, label: "Compartir" },
          { icon: <Send className="w-4 h-4" />, label: "Enviar" },
        ].map((a) => (
          <button key={a.label} className="flex flex-col items-center py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            {a.icon}
            <span className="text-[10px] mt-0.5">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Twitter/X Feed ─── */
function TwitterFeed({ userPost, metrics }: Omit<Props, "platform">) {
  return (
    <div className="bg-black rounded-2xl overflow-hidden text-white shadow-lg border border-white/10">
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">TÚ</div>
          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[15px] font-bold text-white">Tu Marca</span>
              <span className="text-[13px] text-gray-500">@tu_marca · 2h</span>
            </div>
            {/* Post */}
            <p className="text-[15px] text-white/95 leading-[1.4] whitespace-pre-wrap mb-3">{userPost}</p>
            {/* Metrics */}
            <div className="flex items-center gap-6 text-gray-500 text-[13px]">
              <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                <MessageCircle className="w-4 h-4" /> {metrics.comments}
              </span>
              <span className="flex items-center gap-1.5 hover:text-green-400 cursor-pointer">
                <Repeat2 className="w-4 h-4" /> {metrics.shares}
              </span>
              <span className="flex items-center gap-1.5 hover:text-pink-400 cursor-pointer">
                <Heart className="w-4 h-4" /> {fmt(metrics.likes)}
              </span>
              <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
                <Eye className="w-4 h-4" /> {fmt(metrics.reach)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TikTok Feed ─── */
function TikTokFeed({ userPost, visualDescription, metrics }: Omit<Props, "platform">) {
  return (
    <div className="bg-black rounded-2xl overflow-hidden text-white shadow-lg relative" style={{ aspectRatio: "9/14", maxHeight: 420 }}>
      {/* Video background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-10" />
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        {visualDescription ? (
          <div className="p-6 text-center z-0">
            <p className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">Video descrito</p>
            <p className="text-sm text-white/80 italic leading-relaxed">"{visualDescription}"</p>
          </div>
        ) : (
          <div className="text-white/30 text-center">
            <div className="text-4xl mb-1">🎬</div>
            <p className="text-xs">Video</p>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-4">
        <div>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xs font-bold border-2 border-white">TÚ</div>
        </div>
        {[
          { icon: <Heart className="w-6 h-6" />, val: fmt(metrics.likes) },
          { icon: <MessageCircle className="w-6 h-6" />, val: String(metrics.comments) },
          { icon: <Share2 className="w-6 h-6" />, val: String(metrics.shares) },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            {item.icon}
            <span className="text-[10px] font-bold mt-0.5">{item.val}</span>
          </div>
        ))}
      </div>

      {/* Bottom caption */}
      <div className="absolute bottom-0 left-0 right-14 z-20 p-4">
        <p className="text-[13px] font-semibold mb-1">@tu_marca</p>
        <p className="text-[12px] text-white/90 leading-[1.3] line-clamp-3 whitespace-pre-wrap">{userPost}</p>
        <div className="flex items-center gap-1.5 mt-2 text-white/60">
          <Music className="w-3 h-3" />
          <span className="text-[10px]">Sonido original - tu_marca</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function PlatformFeed({ platform, userPost, visualDescription, metrics }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {platform === "instagram" && <InstagramFeed userPost={userPost} visualDescription={visualDescription} metrics={metrics} />}
      {platform === "linkedin" && <LinkedInFeed userPost={userPost} metrics={metrics} />}
      {platform === "twitter" && <TwitterFeed userPost={userPost} metrics={metrics} />}
      {platform === "tiktok" && <TikTokFeed userPost={userPost} visualDescription={visualDescription} metrics={metrics} />}
    </motion.div>
  );
}
