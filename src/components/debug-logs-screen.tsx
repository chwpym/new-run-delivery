"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLogs, clearLogs } from '@/lib/db';
import { format } from 'date-fns';
import { Trash2, RefreshCcw } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export function DebugLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);

  const loadLogs = async () => {
    const data = await getLogs();
    setLogs(data);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClear = async () => {
    if (confirm("Tem certeza que deseja limpar todos os logs?")) {
      await clearLogs();
      await loadLogs();
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-destructive font-bold';
      case 'warn': return 'text-yellow-500 font-bold';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-4 space-y-4">
      <Card className="h-[calc(100vh-140px)] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Logs do Sistema</CardTitle>
            <CardDescription>Ferramenta de diagnóstico (GPS e Background)</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={loadLogs}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-6 py-2">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum log registrado ainda.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-border pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${getLevelColor(log.level)}`}>
                        [{log.level.toUpperCase()}] {format(log.timestamp, 'dd/MM HH:mm:ss')}
                      </span>
                    </div>
                    <p className="text-sm">{log.message}</p>
                    {log.data && (
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
