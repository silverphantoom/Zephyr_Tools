'use client';

import { motion } from 'framer-motion';
import { Users, Mail, Plus, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const teamMembers = [
  { name: 'Alex Chen', role: 'Product Manager', email: 'alex@company.com', status: 'active', tasks: 12 },
  { name: 'Sarah Miller', role: 'Designer', email: 'sarah@company.com', status: 'active', tasks: 8 },
  { name: 'James Wilson', role: 'Developer', email: 'james@company.com', status: 'away', tasks: 15 },
  { name: 'Emily Davis', role: 'Developer', email: 'emily@company.com', status: 'active', tasks: 10 },
  { name: 'Michael Brown', role: 'QA Engineer', email: 'michael@company.com', status: 'offline', tasks: 6 },
];

export default function TeamPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Team</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your team members</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Members</p>
                  <p className="text-3xl font-bold">{teamMembers.length}</p>
                </div>
                <Users className="w-10 h-10 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Active Now</p>
                  <p className="text-3xl font-bold">3</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Tasks</p>
                  <p className="text-3xl font-bold">51</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  T
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamMembers.map((member, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        member.status === 'active' ? 'bg-green-500' : 
                        member.status === 'away' ? 'bg-yellow-500' : 'bg-slate-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{member.tasks}</p>
                      <p className="text-xs text-slate-500">tasks</p>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}