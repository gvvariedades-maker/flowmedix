import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { LogicConnectors } from './LogicConnectors';

export default function NeuroSlide({ data }: { data: any }) {
  if (!data || !data.structure) return null;
  const { structure, design_system } = data;
  
  // Cores dinâmicas do sistema
  const itemColor = design_system?.glow_color || "#FF6B6B";
  const logicColor = design_system?.logic_color || "#38BDF8"; // Cor da barra de lógica
  const ruleColor = "#EAB308"; // Amarelo fixo da regra de ouro

  return (
    <div className="relative w-full h-full max-h-[100vh] flex flex-col items-center justify-between p-4 bg-[#020617] overflow-hidden rounded-[40px]">
      
      {/* ATMOSPHERE: Spotlight central mais intenso */}
      <div 
        className="absolute inset-0 z-0 opacity-40" 
        style={{ background: `radial-gradient(circle at 50% 30%, ${itemColor}33 0%, transparent 70%)` }}
      />

      {/* HEADER: Subimos para ganhar espaço embaixo */}
      <div className="relative z-10 text-center mt-1 mb-2">
        <h1 className="text-4xl md:text-6xl font-[1000] text-white uppercase tracking-tighter italic leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
          {structure.header.title}
        </h1>
        <p 
          className="text-xs md:text-sm font-black tracking-[0.5em] uppercase mt-1 drop-shadow-md"
          style={{ color: itemColor }}
        >
          {structure.header.subtitle}
        </p>
      </div>

      {/* ÁREA CENTRAL: Blocos principais elevados */}
      <div className="relative z-10 w-full flex flex-col items-center flex-1 justify-center -mt-8">
        
        {/* RETÂNGULOS PRINCIPAIS: Aumentados e com Hover */}
        <div className="flex w-full max-w-5xl justify-around items-center px-2 md:px-8 relative mb-2">
          {structure.items.slice(0, 2).map((item: any, index: number) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.08, filter: "brightness(1.3)", boxShadow: `0 0 40px ${itemColor}` }}
              className="relative w-[46%] py-10 md:py-14 rounded-[2.5rem] border-[4px] bg-slate-900/80 backdrop-blur-3xl flex items-center justify-center text-center px-6 cursor-pointer transition-all duration-300"
              style={{ 
                borderColor: itemColor, 
                boxShadow: `0 0 25px ${itemColor}66` 
              }}
            >
              <span className="text-2xl md:text-5xl font-[1000] text-white tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* CONECTORES: Altura otimizada */}
        <div className="h-14 w-full">
           <LogicConnectors color={itemColor} />
        </div>

        {/* BARRA DE LÓGICA (AZUL/DINÂMICA): Largura aumentada */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="w-[96%] py-5 rounded-full border-[3px] bg-slate-900/60 backdrop-blur-xl flex justify-center items-center mb-4 shadow-xl cursor-help transition-all duration-300 hover:brightness-110"
          style={{ borderColor: logicColor, boxShadow: `0 0 20px ${logicColor}44` }}
        >
          <span 
            className="font-[1000] tracking-[0.4em] text-xs md:text-lg uppercase px-8 text-center drop-shadow-sm"
            style={{ color: logicColor }}
          >
            {structure.connector_text}
          </span>
        </motion.div>

        {/* BARRA AMARELA: Monumental e PROPORCIONAL */}
        <motion.div 
          whileHover={{ x: 10, filter: "brightness(1.1)" }}
          className="w-[98%] border-l-[15px] border-yellow-500 bg-yellow-500/10 p-6 shadow-2xl rounded-r-[2.5rem] flex items-center gap-6 mb-1"
        >
          <div className="p-3 bg-yellow-500 rounded-2xl text-black shrink-0 shadow-[0_0_30px_#eab308]">
            <Lightbulb size={36} strokeWidth={4} />
          </div>
          <p className="text-white font-[1000] text-sm md:text-2xl leading-tight tracking-tight uppercase italic">
            {structure.footer_rule}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
